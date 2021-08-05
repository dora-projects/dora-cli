import chalk from 'chalk';
import os from 'os';
import { compress, copy } from 'src/helper/fs';
import { timeNowFormat } from 'src/helper/time';
import ora from 'ora';
import Joi from 'joi';
import inquirer from 'inquirer';
import { NodeSSH } from 'node-ssh';
import dayjs from 'dayjs';
import { getConfig } from 'src/config';
import { Config, Machine } from 'src/type';

const deploySchema = Joi.array().min(1).items(
  Joi.object({
    label: Joi.string().required(),
    description: Joi.string().required(),
    ip: Joi.string().ip().required(),
    user: Joi.string().required(),
    destDir: Joi.string().required(),
  }),
);

const cwd = process.cwd();
const tmpProdDir = `${cwd}/tmp/dora/prod`;
const outputProd = `${cwd}/tmp/dora/prod.zip`;

let spinner: ora.Ora|null = null;

export default async function(labels: string[]): Promise<void> {
  const conf = getConfig();
  if (!conf) return;

  // 校验
  const validate = deploySchema.validate(conf.deploy);
  if (validate.error) {
    console.log();
    console.log(chalk.redBright('incorrect！ please check deploy env config'));
    console.log();
    console.log(chalk.red(JSON.stringify(validate.error, null, 2)));
    console.log();
    return;
  }
  const dir = conf.base.outDir;
  const absOutDir = `${cwd}/${dir}`;

  let deployLists;

  // 不询问
  if (labels) {
    deployLists = conf.deploy?.filter((i) => labels.includes(i.label)) || [];
  } else {
    // 询问
    try {
      deployLists = await userQuestion(conf) || [];
    } catch (e) {
      return;
    }
  }


  // 复制
  try {
    spinner = ora('copy file...').start();
    copy(absOutDir, tmpProdDir, (file) => !(/\.map$/.test(file)));
    spinner.succeed('copy file finished');
  } catch (e) {
    console.log(e);
    return;
  }

  // 压缩
  try {
    spinner.start('compress prod files...');
    await compress(tmpProdDir, outputProd);
    spinner.succeed('compress file finished');
    //
  } catch (e) {
    console.log(e);
  }

  // ssh
  for (const deployItem of deployLists) {
    const { ip, user, destDir, label, description } = deployItem;
    try {
      if (ip && user && destDir) {
        spinner.start(`scp files... ${label} ${description}`);
        await scpFileToRemote(outputProd, user, ip, destDir);
      }
    } catch (e) {
      console.log();
      console.log(chalk.red('info:', e.message));
      spinner.stop();
      return;
    }
  }
  spinner.succeed('deploy finished!');
  spinner.stop();
}

async function userQuestion(conf: Config): Promise<Machine[]|null> {
  const options = conf.deploy?.map((i) => {
    return {
      name: `【${i.label} ${i.description} ${i.ip}】`,
      value: i.label,
    };
  });

  // 询问
  const { values: userChoiceValues } = await inquirer
    .prompt([{
      type: 'checkbox',
      message: 'select env to deploy',
      name: 'values',
      choices: options,
      validate(answer) {
        if (answer.length < 1) {
          return 'You must choose at least one env.';
        }
        return true;
      },
    }]);

  const checkedMachine = conf.deploy?.filter((i) => userChoiceValues.includes(i.label)) || [];

  // 确认
  const { values: confirm } = await inquirer
    .prompt([{
      type: 'confirm',
      name: 'values',
      message: `are you sure deploy to \n\n ${chalk.green(JSON.stringify(checkedMachine, null, 2))} \n\n`,
      default: false,
    }]);

  if (!confirm) {
    console.log(chalk.gray('canceled!'));
    console.log();
    throw new Error('canceled!');
  }

  return checkedMachine;
}

async function scpFileToRemote(file: string, user: string, ip: string, destDir: string): Promise<void> {
  const ssh = new NodeSSH();

  let conn;
  try {
    conn = await ssh.connect({
      host: ip,
      username: user,
      port: 22,
      privateKey: `${os.homedir()}/.ssh/id_rsa`,
    });
  } catch (e) {
    console.log();
    console.log(chalk.red('error:', e.message));

    const isAuthFailed = e.message.indexOf('authentication') > -1;
    if (isAuthFailed) {
      console.log(chalk.red(`please copy key to host:`));
      console.log();
      console.log(chalk.red(`    ssh-copy-id ${user}@${ip}`));
    }

    throw new Error('connect failed!');
  }

  if (!conn.isConnected()) {
    console.log('connect failed!');
    return;
  }

  const remotePath = `/var/tmp/dora/`;
  const remoteFileName = `${dayjs().format('YYYYMMDD_HHmmss')}.zip`;

  await ssh.putFile(file, remotePath + remoteFileName, null, {
    concurrency: 1,
  });

  const result = await ssh.execCommand(`cd ${remotePath} && unzip -q -o -d ${destDir} ${remoteFileName}`);
  console.log();
  result.stdout && console.log(chalk.green(result.stdout));
  result.stderr && console.log(chalk.red(result.stderr));

  if (result.stderr) {
    throw new Error('execCommand unzip fail!');
  }
  console.log(chalk.green(`
-------------------------------------------------
time: ${timeNowFormat()}
msg: success deploy ${user}@${ip}  
dir: ${destDir}
-------------------------------------------------
`));

  // dispose
  ssh.dispose();
}

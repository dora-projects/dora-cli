import chalk from 'chalk';
import os from 'os';
import { compress, copy } from '../helper/fs';
import { timeNowFormat } from '../helper/time';
import ora from 'ora';
import Joi from 'joi';
import inquirer from 'inquirer';
import { NodeSSH } from 'node-ssh';
import dayjs from 'dayjs';
import { getConfig } from '../config';
import { Config, Env } from '../type';

const deploySchema = Joi.array().min(1).items(
  Joi.object({
    env: Joi.string().required(),
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

export default async function(): Promise<void> {
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

  // 询问
  let selectedEnvs;
  try {
    selectedEnvs = await userQuestion(conf) || [];
  } catch (e) {
    return;
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
  for (const selectEnv of selectedEnvs) {
    const { ip, user, destDir } = selectEnv;
    try {
      if (ip && user && destDir) {
        spinner.start(`scp files... ${user}@${ip} destDir:${destDir}`);
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

async function userQuestion(conf: Config): Promise<Env[]|null> {
  const options = conf.deploy?.map((i) => {
    return {
      name: `${i.env} ${i.description} ${i.ip}`,
      value: i.ip,
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

  // 确认
  // const selectedOptions = options?.filter((i) => userChoiceValues.indexOf(i.value) > -1) || [];
  // const confirmTxt = `${selectedOptions.map((op) => op.name).join('\n')}`;

  const { values: confirm } = await inquirer
    .prompt([{
      type: 'confirm',
      name: 'values',
      message: `are you sure deploy`,
      default: false,
    }]);

  if (!confirm) {
    console.log(chalk.gray('canceled!'));
    console.log();
    throw new Error('canceled!');
  }

  return conf.deploy?.filter((i) => userChoiceValues.indexOf(i.ip) > -1) || [];
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
    console.log(chalk.red(`please copy key to host:

    ssh-copy-id ${user}@${ip}`));

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
  result.stdout && console.log(chalk.cyan(result.stdout));
  result.stderr && console.log(chalk.red(result.stderr));

  if (result.stderr) {
    throw new Error('execCommand unzip fail!');
  }
  console.log(chalk.cyan(`
-------------------------------------------------------------
${timeNowFormat()}
success deploy ${user}@${ip}  dir:${destDir}
-------------------------------------------------------------
`));

  // dispose
  ssh.dispose();
}

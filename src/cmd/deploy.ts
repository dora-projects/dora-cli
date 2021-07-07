import chalk from 'chalk';
import os from 'os';
import { compress, copy } from '../helper/fs';
import ora from 'ora';
import Joi from 'joi';
import inquirer from 'inquirer';
import { NodeSSH } from 'node-ssh';
import dayjs from 'dayjs';
import { getConfig } from '../config';

const deploySchema = Joi.array().min(1).items(
  Joi.object({
    env: Joi.string().required(),
    description: Joi.string().required(),
    hosts: Joi.array().min(1).items(
      Joi.object({
        ip: Joi.string().ip().required(),
        user: Joi.string().required(),
        destDir: Joi.string().required(),
      }),
    ),
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

  const envsOptions = conf.deploy?.map((i) => {
    return {
      name: `${i.env} (${i.description})`,
      value: i.env,
    };
  });

  const dir = conf.base.outDir;
  const absOutDir = `${cwd}/${dir}`;

  // 询问
  const { values: userChoiceValues } = await inquirer
    .prompt([{
      type: 'checkbox',
      message: 'select env to deploy',
      name: 'values',
      choices: envsOptions,
      validate(answer) {
        if (answer.length < 1) {
          return 'You must choose at least one env.';
        }
        return true;
      },
    }]);

  // 确认
  const { values: confirm } = await inquirer
    .prompt([{
      type: 'confirm',
      name: 'values',
      message: `are you sure deploy to [${userChoiceValues.join(',')}]`,
      default: false,
    }]);

  if (!confirm) {
    console.log(chalk.gray('canceled!'));
    console.log();
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
  spinner.start('ssh hosts deliver prod files...');
  const selectEnvs = conf.deploy?.filter((i) => userChoiceValues.indexOf(i.env) > -1) || [];
  for (const selectEnv of selectEnvs) {
    for (const host of selectEnv.hosts) {
      try {
        if (host.ip && host.user && host.destDir) {
          await scpFileToRemote(outputProd, host.ip, host.user, host.destDir);
        }
      } catch (e) {
        console.log();
        console.log(chalk.red('info:', e.message));
        spinner.stop();
        return;
      }
    }
  }
  spinner.succeed('deploy finished! 😀');
  spinner.stop();
}

async function scpFileToRemote(file: string, ip: string, user: string, destDir: string): Promise<void> {
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
    console.log(chalk.red(`please try to login host:

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
  const result = await ssh.execCommand(`cd ${remotePath} && unzip -o -d ${destDir} ${remoteFileName}`);
  console.log();
  console.log(chalk.greenBright(result.stdout));
  console.log(chalk.red(result.stderr));

  // dispose
  ssh.dispose();
}

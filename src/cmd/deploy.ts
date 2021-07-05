import chalk from 'chalk';
import os from 'os';
import { compress, copy } from '../helper/fs';
import ora from 'ora';
import inquirer from 'inquirer';
import { NodeSSH } from 'node-ssh';
import dayjs from 'dayjs';
import { getConfig } from '../config';

const cwd = process.cwd();
const tmpProdDir = `${cwd}/tmp/dora/prod`;
const outputProd = `${cwd}/tmp/dora/prod.zip`;

let spinner: ora.Ora|null = null;

export default async function(): Promise<void> {
  const conf = getConfig();
  if (!conf) return;
  if (!Array.isArray(conf.deploy) || conf.deploy.length <= 0) {
    console.log(chalk.yellow(`please add deploy env config`));
    return;
  }

  const envs = conf.deploy.map((i) => i.env).filter((i) => Boolean(i));
  if (envs.length <= 0) {
    console.log(chalk.yellow(`incorrect！ please check deploy env config`));
    return;
  }

  const dir = conf.base.outDir;
  const absOutDir = `${cwd}/${dir}`;

  // 询问
  const { values: userChoiceValues } = await inquirer
    .prompt([{
      type: 'checkbox',
      message: 'Select env to deploy',
      name: 'values',
      choices: envs,
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
    spinner.succeed('compress file finished 👍');
    //
  } catch (e) {
    console.log(e);
  }

  // ssh
  spinner.start('ssh hosts deliver prod files...');
  const selectEnvs = conf.deploy.filter((i) => userChoiceValues.indexOf(i.env) > -1);
  for (const selectEnv of selectEnvs) {
    for (const host of selectEnv.hosts) {
      try {
        if (host.ip && host.user && host.destDir) {
          await scpFileToRemote(outputProd, host.ip, host.user, host.destDir);
        }
      } catch (e) {
        console.log('error:', e);
      }
    }
  }
  spinner.succeed('deploy finished! 🐂👍');
  spinner.stop();
}

async function scpFileToRemote(file: string, ip: string, user: string, destDir: string): Promise<void> {
  const ssh = new NodeSSH();
  const conn = await ssh.connect({
    host: ip,
    username: user,
    port: 22,
    privateKey: `${os.homedir()}/.ssh/id_rsa`,
  });
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

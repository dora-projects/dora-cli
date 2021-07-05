import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { timeNowFormat } from '../helper/time';
import dayjs from 'dayjs';

const error = chalk.bold.red;

const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
};

const git: SimpleGit = simpleGit(options);

interface genVersionTagProps {
  msg: string,
  filename: string
}

/**
 * git tag
 * 生成版本信息文件
 * 输出
 */
const genVersionTag = async (options: genVersionTagProps): Promise<void> => {
  const { msg, filename } = options;
  const pwd = process.cwd();

  try {
    // todo 自动version
    msg && await git.addTag(msg);

    const configDest = path.resolve(pwd, filename);

    const now = timeNowFormat();
    const logs = await git.log();
    const latestLog = logs.latest;

    const versionInfo = JSON.stringify({
      tag: msg,
      build_date: now,
      author: latestLog?.author_name,
      author_mail: latestLog?.author_email,
      commit_hash: latestLog?.hash,
      commit_date: latestLog?.date && dayjs(latestLog?.date).format('YYYY-MM-DD HH:mm:ss'),
    }, null, 2);

    await fs.writeFile(configDest, versionInfo);

    console.log(chalk.green(`
版本信息已生成！！
文件存放在：${configDest}
--------------------------------------------------------
${versionInfo}
--------------------------------------------------------
`));

  } catch (e) {
    console.log(error(e));
  }
};

export default genVersionTag;

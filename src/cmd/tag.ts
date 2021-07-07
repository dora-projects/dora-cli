import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';
import { timeNowFormat } from '../helper/time';
import { getGitConfig, getGitLogs } from '../helper/git';

const error = chalk.bold.red;

const genVersionTag = async (): Promise<void> => {
  const pwd = process.cwd();
  const configDest = path.resolve(pwd, '.dora_tag.json');

  try {
    const now = timeNowFormat();
    const logs = await getGitLogs();
    const latestLog = logs.latest;

    // const config = await getGitConfig();
    // console.log(config)

    const versionInfo = JSON.stringify({
      author: latestLog?.author_name,
      author_mail: latestLog?.author_email,
      author_msg: latestLog?.message,
      commit_hash: latestLog?.hash,
      commit_at: latestLog?.date && dayjs(latestLog?.date).format('YYYY-MM-DD HH:mm:ss'),
      timestamp: now,
    }, null, 2);

    await fs.writeFile(configDest, versionInfo);

    console.log(chalk.gray(`
tag file generated！！
location：${configDest}
`));

    console.log(chalk.green(`
--------------------------------------------------------
${versionInfo}
--------------------------------------------------------
    `));

  } catch (e) {
    console.log(error(e));
  }
};

export default genVersionTag;

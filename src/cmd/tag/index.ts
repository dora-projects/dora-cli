import chalk from 'chalk';
import dayjs from 'dayjs';
import { timeNowFormat } from 'src/helper/time';
import { git, getGitLogs } from 'src/helper/git';
import { dumpFile } from 'src/config';
import * as logger from 'src/helper/logger';

const error = chalk.bold.red;

// todo 检测本地 是否有未提交的文件
const genVersionTag = async (): Promise<void> => {
  try {
    const nowDay = dayjs().format('MMDDHHmm');
    const shortHash = await git.raw('log', '-1', '--pretty=format:%h');
    const versionTag = `${nowDay}@${shortHash}`;

    const branch = await git.branch();
    const now = timeNowFormat();

    const logs = await getGitLogs();
    const latestLog = logs.latest;

    const versionInfo: Partial<Tags> = {
      author: latestLog?.author_name,
      author_mail: latestLog?.author_email,
      author_msg: latestLog?.message,
      git_branch: branch.current,
      commit_hash: latestLog?.hash,
      release: versionTag,
      commit_at: latestLog?.date && dayjs(latestLog?.date).format('YYYY-MM-DD HH:mm:ss'),
      timestamp: now,
    };

    await dumpFile(versionInfo, '.dora_tag.json');

    logger.success(`tag file generated: .dora_tag.json`);
    logger.printJson(versionInfo);
  } catch (e) {
    console.log(error(e));
  }
};

export default genVersionTag;

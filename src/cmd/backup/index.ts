import path from 'path';
import ora from 'ora';
import dayjs from 'dayjs';
import chalk from 'chalk';
import { constant, getConfig, getTag } from 'src/config';
import { uploadZips } from 'src/helper/upload';
import { getGitLogs, git } from 'src/helper/git';
import { compress, copy, isExist } from 'src/helper/fs';
import * as logger from 'src/helper/logger';

const cwd = process.cwd();
let spinner: ora.Ora|null = null;

const tmpAllDir = `${cwd}/tmp/dora/dist`;
const outputAll = `${cwd}/tmp/dora/dist.zip`;

// 备份构建产物
export default async function(): Promise<void> {
  const conf = await getConfig();
  if (!conf) return;
  const tags = await getTag();
  if (!tags) return;

  const { outDir, accessToken, appKey, serverUrl } = conf.base;
  const release = tags.release;
  const absOutDir = `${constant.cwd}/${outDir}`;

  if (!isExist(absOutDir)) {
    console.log();
    console.log(`outDir is not exist: ${chalk.redBright(absOutDir)}
please check you base.outDir config or build you project!`);
    console.log();
    return;
  }
  spinner = ora('copy file...').start();

  // 复制
  try {
    copy(absOutDir, tmpAllDir, () => true);
    spinner.succeed('copy file finished');
  } catch (e) {
    console.log(e);
    return;
  }

  // 压缩
  try {
    spinner.start('compress build files...');
    await compress(tmpAllDir, outputAll);
    spinner.succeed('compress file finished 👍');
  } catch (e) {
    console.log(e);
  }

  // 上传
  try {
    spinner?.start(`upload files... 😝`);

    const branch = await git.branch();
    const logs = await getGitLogs();
    const latestLog = logs.latest;

    const data: UploadBackupFields = {
      appKey: appKey,
      project_name: path.basename(cwd),
      release: release,

      author: latestLog?.author_name,
      author_mail: latestLog?.author_email,
      git_branch: branch.current,
      commit: latestLog?.message,
      commit_hash: latestLog?.hash,
      commit_at: dayjs(latestLog?.date).format('YYYY-MM-DD HH:mm:ss'),

      file_name: 'dist.zip',
    };

    spinner?.start('upload dist.zip...');
    await uploadZips(serverUrl, accessToken, outputAll, data);
    spinner?.succeed('backup file upload success 👏');

    logger.success('backup success!');
  } catch (e: any) {
    if (e.response?.data) console.log(e.response?.data);
    logger.error(e);
  } finally {
    spinner.stop();
  }
}

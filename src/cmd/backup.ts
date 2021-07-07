import path from 'path';
import ora from 'ora';
import dayjs from 'dayjs';
import { getConfig } from '../config';
import { uploadZips } from '../helper/upload';
import { getGitLogs, git } from '../helper/git';
import { compress, copy, isExist } from '../helper/fs';
import chalk from 'chalk';

const cwd = process.cwd();
let spinner: ora.Ora|null = null;

const tmpAllDir = `${cwd}/tmp/dora/all`;
const tmpProdDir = `${cwd}/tmp/dora/prod`;
const tmpSourcemapDir = `${cwd}/tmp/dora/sourcemap`;

const outputAll = `${cwd}/tmp/dora/all.zip`;
const outputProd = `${cwd}/tmp/dora/prod.zip`;
const outputSourcemap = `${cwd}/tmp/dora/sourcemap.zip`;

// 备份构建产物
export default async function(): Promise<void> {
  const conf = getConfig();
  if (!conf) return;
  const dir = conf.base.outDir;
  const appId = conf.base.appId;
  const serverUrl = conf.base.serverUrl;
  const absOutDir = `${cwd}/${dir}`;

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
    copy(absOutDir, tmpProdDir, (file) => !(/\.map$/.test(file)));
    copy(absOutDir, tmpSourcemapDir, (file) => /\.map$/.test(file));
    spinner.succeed('copy file finished');
  } catch (e) {
    console.log(e);
    return;
  }

  // 压缩
  try {
    spinner.start('compress all files...');
    await compress(tmpAllDir, outputAll);
    spinner.start('compress prod files...');
    await compress(tmpProdDir, outputProd);
    spinner.start('compress sourcemap files...');
    await compress(tmpSourcemapDir, outputSourcemap);
    spinner.succeed('compress file finished 🐂🐂👍👍👍');
  } catch (e) {
    console.log(e);
  }

  // 上传
  await stepUpload(appId, serverUrl);
  spinner.stop();
}


async function stepUpload(appId: string, serverUrl: string) {
  try {
    spinner?.start('upload files... 😝');

    const branch = await git.branch();
    const logs = await getGitLogs();
    const latestLog = logs.latest;

    const data = {
      appId,
      project_name: path.basename(cwd),

      git_name: latestLog?.author_name,
      git_email: latestLog?.author_email,
      git_branch: branch.current,

      commit: latestLog?.message,
      commit_sha: latestLog?.hash,
      commit_ts: dayjs(latestLog?.date).format('YYYY-MM-DD HH:mm:ss'),
    };

    const allFile = { file_name: 'all.zip', file_type: 'all', file_path: outputAll };
    spinner?.start('upload all.zip...');
    await uploadZips(serverUrl, { ...data, ...allFile });

    const ProdFile = { file_name: 'prod.zip', file_type: 'prod', file_path: outputProd };
    spinner?.start('upload prod.zip...');
    await uploadZips(serverUrl, { ...data, ...ProdFile });

    const SourcemapFile = { file_name: 'sourcemap.zip', file_type: 'sourcemap', file_path: outputSourcemap };
    spinner?.start('upload sourcemap.zip...');
    await uploadZips(serverUrl, { ...data, ...SourcemapFile });

    spinner?.succeed('all file upload success 👏👏👏');
  } catch (e) {
    console.log(e.message);
  }
}

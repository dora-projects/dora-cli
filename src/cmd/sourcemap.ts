import path from 'path';
import ora from 'ora';
import { getConfig, constant } from '../config';
import { uploadSourcemapZips } from '../helper/upload';
import { compress, copy, isExist } from '../helper/fs';
import chalk from 'chalk';

let spinner: ora.Ora|null = null;
export default async function uploadSourcemap(): Promise<void> {
  const conf = getConfig();
  if (!conf) return;

  const dir = conf.base.outDir;
  const appId = conf.base.appId;
  const serverUrl = conf.base.serverUrl;
  const absOutDir = `${constant.cwd}/${dir}`;

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
    copy(absOutDir, constant.tmpSourcemapDir, (file) => /\.map$/.test(file));
    spinner.succeed('copy file finished');
  } catch (e) {
    console.log(e);
    return;
  }

  // 压缩
  try {
    spinner.start('compress sourcemap files...');
    await compress(constant.tmpSourcemapDir, constant.outputSourcemap);
    spinner.succeed('compress file finished');
  } catch (e) {
    console.log(e);
  }

  // 上传
  await stepUpload(appId, serverUrl);
  spinner.stop();
  console.log('--------------------------------')
  console.log("  upload sourcemap success!")
  console.log('--------------------------------')
};


async function stepUpload(appId: string, serverUrl: string) {
  try {
    spinner?.start('upload files... 😝');

    const data = {
      appId,
      project_name: path.basename(constant.cwd),
    };

    const SourcemapFile = { file_name: 'sourcemap.zip', file_path: constant.outputSourcemap };
    spinner?.start('upload sourcemap.zip...');
    await uploadSourcemapZips(serverUrl, { ...data, ...SourcemapFile });

    spinner?.succeed('all file upload success 👏');
  } catch (e) {
    console.log()
    console.log(chalk.red(`upload got error: ${e.message}`));
  }
}

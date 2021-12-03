import path from 'path';
import ora from 'ora';
import { getConfig, constant } from 'src/config';
import { uploadSourcemapZips } from 'src/helper/upload';
import { compress, copy, isExist } from 'src/helper/fs';
import chalk from 'chalk';

let spinner: ora.Ora|null = null;
export default async function uploadSourcemap(): Promise<void> {
  const conf = getConfig();
  if (!conf) return;

  const dir = conf.base.outDir;
  const appKey = conf.base.appKey;
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
  await stepUpload(appKey, serverUrl);
  spinner.stop();
  console.log('--------------------------------');
  console.log('  upload sourcemap success!');
  console.log('--------------------------------');
};


async function stepUpload(appKey: string, serverUrl: string) {
  try {
    spinner?.start('upload files... 😝');

    const data = {
      appKey,
      project_name: path.basename(constant.cwd),
    };

    const SourcemapFile = { file_name: 'sourcemap.zip', file_path: constant.outputSourcemap };
    spinner?.start('upload sourcemap.zip...');
    await uploadSourcemapZips(serverUrl, { ...data, ...SourcemapFile });

    spinner?.succeed('all file upload success 👏');
  } catch (e) {
    const err = e as Error;
    console.log();
    console.log(chalk.red(`upload got error: ${err.message}`));
  }
}

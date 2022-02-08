import path from 'path';
import ora from 'ora';
import { getConfig, constant, getTag } from 'src/config';
import { uploadSourcemapZips } from 'src/helper/upload';
import { compress, copy, isExist } from 'src/helper/fs';
import chalk from 'chalk';
import * as logger from 'src/helper/logger';

let spinner: ora.Ora|null = null;
export default async function uploadSourcemap(): Promise<void> {
  const conf = await getConfig();
  if (!conf) return;
  const tags = await getTag();
  if (!tags) return;

  const { outDir, accessToken, appKey, serverUrl } = conf.base;
  const release = tags.release;
  const absOutDir = `${constant.cwd}/${outDir}`;

  if (!isExist(absOutDir)) {
    logger.info(`outDir is not exist: ${chalk.redBright(absOutDir)}
please check you base.outDir config or build you project!`);
    return;
  }
  spinner = ora('copy file...').start();

  // 复制
  try {
    let existMapFile = false;
    copy(absOutDir, constant.tmpSourcemapDir, (file) => {
      const m = /\.map$/.test(file);
      if (m) {
        existMapFile = m;
      }
      return m;
    });

    if (existMapFile) {
      spinner.succeed('copy file finished');
    } else {
      spinner.fail('can`t find any .map file');
      return;
    }
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
  await stepUpload({ accessToken, appKey, release, serverUrl });
  spinner.stop();

  logger.success('upload sourcemap success!');
}

async function stepUpload(params: {
  accessToken: string;
  appKey: string;
  release: string;
  serverUrl: string;
}) {
  try {
    spinner?.start('upload files... 😝');

    const data: UploadSourcemapFields = {
      appKey: params.appKey,
      project_name: path.basename(constant.cwd),
      release: params.release,
      file_name: 'sourcemap.zip',
    };

    spinner?.start('upload sourcemap.zip...');
    await uploadSourcemapZips(params.serverUrl, params.accessToken, constant.outputSourcemap, data);

    spinner?.succeed('sourcemap file upload success 👏');
  } catch (e: any) {
    console.log();
    console.log(chalk.red(`upload got error: ${e}`));
    console.log(e?.response?.data);
  }
}

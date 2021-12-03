import path from 'path';
import ora from 'ora';
import { getConfig, constant } from 'src/config';
import { uploadSourcemapZips } from 'src/helper/upload';
import { compress, copy, isExist } from 'src/helper/fs';
import chalk from 'chalk';
import Joi from 'joi';

const uploadConfigSourcemap = Joi.object({
  outDir: Joi.string().required(),
  appKey: Joi.string().required(),
  serverUrl: Joi.string().required(),
  accessToken: Joi.string().required(),
});

let spinner: ora.Ora|null = null;
export default async function uploadSourcemap(): Promise<void> {
  const conf = getConfig();
  if (!conf) return;

  const validate = uploadConfigSourcemap.validate(conf.base);
  if (validate.error) {
    console.log();
    console.log(chalk.redBright('incorrect！ please check config file .dora.json'));
    console.log();
    console.log(chalk.red(JSON.stringify(validate.error, null, 2)));
    console.log();
    return;
  }

  const { outDir, accessToken, appKey, serverUrl } = conf.base;
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
  await stepUpload(accessToken, appKey, serverUrl);
  spinner.stop();
  console.log('--------------------------------');
  console.log('  upload sourcemap success!');
  console.log('--------------------------------');
};


async function stepUpload(accessToken: string, appKey: string, serverUrl: string) {
  try {
    spinner?.start('upload files... 😝');

    const data = {
      accessToken,
      appKey,
      project_name: path.basename(constant.cwd),
    };

    const SourcemapFile = { file_name: 'sourcemap.zip', file_path: constant.outputSourcemap };
    spinner?.start('upload sourcemap.zip...');
    await uploadSourcemapZips(serverUrl, accessToken, { ...data, ...SourcemapFile });

    spinner?.succeed('all file upload success 👏');
  } catch (e: any) {
    console.log();
    console.log(chalk.red(`upload got error: ${e}`));
    console.log(e?.response?.data);
  }
}

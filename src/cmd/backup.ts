import { access } from 'fs/promises';
import fs, { constants, createReadStream } from 'fs';
import { compress, copy } from '../helper/fs';
import ora from 'ora';
import FormData from 'form-data';

import { getConfig } from '../config';
import chalk from 'chalk';
import { uploadZips } from '../helper/upload';
import { BackupFields } from '../type';

const cwd = process.cwd();

// 备份构建产物
// todo 进度条
export default async function({ ...args }: { appId: string, url: string }): Promise<void> {
  const conf = getConfig();
  if (!conf) return;
  const dir = conf.base.outDir;
  const appId = conf.base.appId;
  const serverUrl = conf.base.serverUrl;

  const outDir = `${cwd}/${dir}`;
  const tmpAllDir = `${cwd}/tmp/dora/all`;
  const tmpProdDir = `${cwd}/tmp/dora/prod`;
  const tmpSourcemapDir = `${cwd}/tmp/dora/sourcemap`;

  try {
    await access(outDir, constants.R_OK);
  } catch {
    console.error('cannot access:' + outDir);
    return;
  }

  const spinner = ora('copy file...').start();

  // 复制
  try {
    copy(outDir, tmpAllDir, () => true);
    copy(outDir, tmpProdDir, (file) => !(/\.map$/.test(file)));
    copy(outDir, tmpSourcemapDir, (file) => /\.map$/.test(file));
    spinner.succeed('copy file finished');
  } catch (e) {
    console.log(e);
    return;
  }

  // 压缩
  const outputAll = `${cwd}/tmp/dora/all.zip`;
  const outputProd = `${cwd}/tmp/dora/prod.zip`;
  const outputSourcemap = `${cwd}/tmp/dora/sourcemap.zip`;
  try {
    spinner.start('compress files...');
    await compress(tmpAllDir, outputAll);
    await compress(tmpProdDir, outputProd);
    await compress(tmpSourcemapDir, outputSourcemap);
    spinner.succeed('compress file finished');
  } catch (e) {
    console.log(e);
  }

  // 上传
  try {
    spinner.start('upload files...');
    const data: BackupFields = {
      appId: conf.base.appId,
      project_name: '',

      file_name: '',
      file_type: '',
      file_path: outputAll,

      git_name: '',
      git_email: '',
      git_branch: '',

      commit: '',
      commit_sha: '',
      commit_ts: '',
    };
    await uploadZips(serverUrl, data);

    spinner.succeed('all file upload success');
  } catch (e) {
    console.log(e);
  }
}

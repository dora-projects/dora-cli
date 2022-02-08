import inquirer from 'inquirer';
import { isExist } from 'src/helper/fs';
import { constant, dumpFile } from 'src/config';
import chalk from 'chalk';
import * as logger from 'src/helper/logger';

const questions = [
  {
    type: 'input',
    name: 'outDir',
    message: "What's project build files folder: (eg: build or dist)",
  },
  {
    type: 'input',
    name: 'appKey',
    message: "What's your appKey:",
  },
  {
    type: 'input',
    name: 'serverUrl',
    message: "What's your dora serverUrl:",
  },
];

const conf: Config = {
  base: {
    outDir: '',
    appKey: '',
    serverUrl: '',
    accessToken: '',
  }
  // deploy: [
  //   {
  //     label: 'test',
  //     description: '',
  //     ip: '',
  //     user: '',
  //     destDir: '',
  //   },
  // ],
};

export default function (): void {
  const hasInit = isExist(`${constant.cwd}/.dora.json`);
  if (hasInit) {
    logger.error(`.dora.json already exists！`);
    return;
  }

  inquirer
    .prompt(questions)
    .then(async (answers) => {
      const { outDir, appKey, serverUrl } = answers;

      conf.base.outDir = outDir;
      conf.base.appKey = appKey;
      conf.base.serverUrl = serverUrl;

      await dumpFile(conf, '.dora.json');

      logger.success(`config file has Generated：.dora.json`);
    })
    .catch((error) => {
      console.log(error);
    });
}

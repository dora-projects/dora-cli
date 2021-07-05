import inquirer from 'inquirer';
import type { Config } from '../type';
import { dumpConfig } from '../config';
import chalk from 'chalk';

const questions = [
  {
    type: 'input',
    name: 'outDir',
    message: 'What\'s project build files folder: (eg: build or dist)',
  },
  {
    type: 'input',
    name: 'appId',
    message: 'What\'s your appId:',
  },
  {
    type: 'input',
    name: 'serverUrl',
    message: 'What\'s your dora serverUrl:',
  },
];

export default function({ ...args }: { appId: string, url: string }): void {
  const conf: Config = {
    base: {
      outDir: '',
      appId: '',
      serverUrl: '',
    },
    deploy: [
      {
        env: 'dev',
        remarks: '',
        hosts: [
          {
            ip: '',
            user: '',
            destDir: '',
          },
        ],
      },
      {
        env: 'test',
        remarks: '',
        hosts: [
          {
            ip: '',
            user: '',
            destDir: '',
          },
        ],
      },
    ],
  };

  // todo 是否覆盖原有文件
  inquirer
    .prompt(questions)
    .then((answers) => {
      const { outDir, appId, serverUrl } = answers;

      conf.base.outDir = outDir;
      conf.base.appId = appId;
      conf.base.serverUrl = serverUrl;

      dumpConfig(conf);

      console.log(chalk.gray('config file has Generated：') + chalk.greenBright(`.dora.json`));
      console.log();
    })
    .catch((error) => {
      console.log(error);
    });
}

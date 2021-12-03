import inquirer from 'inquirer';
import { isExist } from 'src/helper/fs';
import { constant, dumpConfig } from 'src/config';
import chalk from 'chalk';

const questions = [
  {
    type: 'input',
    name: 'outDir',
    message: 'What\'s project build files folder: (eg: build or dist)',
  },
  {
    type: 'input',
    name: 'appKey',
    message: 'What\'s your appKey:',
  },
  {
    type: 'input',
    name: 'serverUrl',
    message: 'What\'s your dora serverUrl:',
  },
];

const conf: Config = {
  base: {
    outDir: '',
    appKey: '',
    serverUrl: '',
  },
  deploy: [
    {
      label: 'test',
      description: '',
      ip: '',
      user: '',
      destDir: '',
    },
  ],
};

export default function(): void {
  const hasInit = isExist(`${constant.cwd}/.dora.json`);
  if (hasInit) {
    console.log(chalk.red(`config file is exist: .dora.json `));
    return;
  }

  inquirer
    .prompt(questions)
    .then((answers) => {
      const { outDir, appKey, serverUrl } = answers;

      conf.base.outDir = outDir;
      conf.base.appKey = appKey;
      conf.base.serverUrl = serverUrl;

      dumpConfig(conf);

      console.log(chalk.gray('config file has Generated：') + chalk.green(`.dora.json`));
      console.log();
    })
    .catch((error) => {
      console.log(error);
    });
}

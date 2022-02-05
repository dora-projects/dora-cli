import chalk from 'chalk';

export const info = (msg: any): void => {
  console.log();
  console.log(chalk.blue(msg));
  console.log();
};

export const warn = (msg: any): void => {
  console.log();
  console.log(chalk.yellow(msg));
  console.log();
};

export const error = (msg: any): void => {
  console.log();
  console.log(chalk.red(msg));
  console.log();
};

export const success = (msg: any): void => {
  console.log();
  console.log(chalk.green(msg));
  console.log();
};

export const printJson = (data: any): void => {
  console.log(
    chalk.gray(`
--------------------------------------------------------
${JSON.stringify(data, null, 2)}
--------------------------------------------------------
`),
  );
};

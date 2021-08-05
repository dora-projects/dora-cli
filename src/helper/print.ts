import ora from 'ora';
import chalk from 'chalk';

type logFunc = (text: string) => void

interface Print {
  type: 'ora'|'basic',
  error: logFunc,
  info: logFunc
  log: logFunc
  spin: logFunc
  succeed: logFunc
  warn: logFunc,
}

function getTime() {
  const time = new Date(Date.now());
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  return `${h > 9 ? '' : '0'}${h}:${m > 9 ? '' : '0'}${m}:${s > 9 ? '' : '0'}${s}`;
}

function createOraPrint(): Print {
  const spinner = ora({
    prefixText: () => chalk.dim(getTime()),
    color: 'blue',
  });
  return {
    type: 'ora',
    error: (text: string) => spinner.fail(chalk.red(text)),
    info: (text: string) => spinner.info(chalk.blue(text)),
    log: (text: string) => spinner.start(text).stopAndPersist({ symbol: '∙' }),
    spin: (text: string) => spinner.start(text),
    succeed: (text: string) => spinner.succeed(chalk.green(text)),
    warn: (text: string) => spinner.warn(chalk.yellow(text)),
  };
}

// Memorise print
let print: Print;

function createPrint(): Print {
  if (print) return print;
  print = createOraPrint();
  return print;
}

export default createPrint;

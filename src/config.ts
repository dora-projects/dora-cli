import fs from 'fs';
import chalk from 'chalk';

let _conf: Config|null = null;

const cwd = process.cwd();

export const constant = {
  cwd: process.cwd(),
  tmpSourcemapDir: `${cwd}/tmp/dora/sourcemap`,
  outputSourcemap: `${cwd}/tmp/dora/sourcemap.zip`,
};

export function loadConfig(path: string): Config|null {
  try {
    const configStr = fs.readFileSync(path, 'utf8');
    _conf = JSON.parse(configStr) as Config;
    return _conf;
  } catch (e) {
    console.log(chalk.blue(`
  no such file: ${chalk.red(path)}
  please add config file in current directory!
`));
    return null;
  }
}

export function dumpConfig(conf: Config): void {
  try {
    const cwd = process.cwd();
    fs.writeFileSync(`${cwd}/.dora.json`, JSON.stringify(conf, null, 2));
  } catch (e) {
    const err = e as Error;

    console.log(chalk.blue(`
--------------------------------------------------------------
  error: ${chalk.red(err?.message)}
--------------------------------------------------------------
`));
  }
}

export function getConfig(): Config|null {
  if (!_conf) {
    return loadConfig(`${process.cwd()}/.dora.json`);
  }
  return _conf;
}

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import Joi from 'joi';

const cwd = process.cwd();

export const constant = {
  cwd: process.cwd(),
  tmpSourcemapDir: `${cwd}/tmp/dora/sourcemap`,
  outputSourcemap: `${cwd}/tmp/dora/sourcemap.zip`,
};

export async function loadFile<T>(path: string): Promise<T|null> {
  try {
    const configStr = await fs.readFile(path, 'utf8');
    return JSON.parse(configStr) as T;
  } catch (e) {
    console.log(chalk.blue(`no files found: ${chalk.red(path)}`));
    return null;
  }
}

export async function dumpFile(data: any, file: string): Promise<void> {
  try {
    const cwd = process.cwd();
    const filePath = path.resolve(cwd, file);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    const err = e as Error;

    console.log(
      chalk.blue(`
--------------------------------------------------------------
  error: ${chalk.red(err?.message)}
--------------------------------------------------------------
`),
    );
  }
}

const configSchema = Joi.object({
  base: Joi.object({
    outDir: Joi.string().required(),
    appKey: Joi.string().required(),
    serverUrl: Joi.string().required(),
    // todo: accessToken required
    accessToken: Joi.string().allow("").optional(),
    tagFilePath: Joi.string().allow("").optional(),
  }),
  deploy: Joi.array()
    .optional()
    .items(
      Joi.object({
        label: Joi.string().required(),
        description: Joi.string().required(),
        ip: Joi.string().ip().required(),
        user: Joi.string().required(),
        destDir: Joi.string().required(),
      }),
    ),
});

export async function getConfig(): Promise<Config|null> {
  const jsonData = await loadFile<Config>(`${process.cwd()}/.dora.json`);
  if (!jsonData) return null;

  const validate = configSchema.validate(jsonData);
  if (validate.error) {
    console.log();
    console.log(chalk.redBright('validate error！ please check file .dora.json'));
    console.log();
    console.log(chalk.red(JSON.stringify(validate.error, null, 2)));
    console.log();
    process.exit(1);
  }
  return jsonData;
}

const tagSchema = Joi.object({
  author: Joi.string().required(),
  author_mail: Joi.string().required(),
  author_msg: Joi.string().required(),
  git_branch: Joi.string().required(),
  commit_hash: Joi.string().required(),
  release: Joi.string().required(),
  commit_at: Joi.string().required(),
  timestamp: Joi.string().required(),
});

export async function getTag(): Promise<Tags|null> {
  const conf = await getConfig();
  if (!conf) return null;

  const tagFile = conf.base.tagFilePath ? conf.base.tagFilePath + '/.dora_tag.json' : '.dora_tag.json';
  const cwd = process.cwd();
  const filePath = path.resolve(cwd, tagFile);

  const jsonData = await loadFile<Tags>(filePath);
  if (!jsonData) return null;

  const validate = tagSchema.validate(jsonData);
  if (validate.error) {
    console.log();
    console.log(chalk.redBright('validate error！ please check file .dora_tag.json'));
    console.log();
    console.log(chalk.red(JSON.stringify(validate.error, null, 2)));
    console.log();
    process.exit(1);
  }
  return jsonData;
}

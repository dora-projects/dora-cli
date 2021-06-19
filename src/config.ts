import fs from 'fs';
import yaml from 'js-yaml';

interface conf {
  appId: string
}

export function loadLocalConfig(path: string): conf|null {
  try {
    const doc = yaml.load(fs.readFileSync(path, 'utf8'));
    // 校验

    console.dir(doc, { depth: null });
  } catch (e) {
    console.log(e);
  }
  return null;
}

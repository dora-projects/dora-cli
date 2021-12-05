import { getConfig, loadFile } from './config';

it('loadLocalConfig', () => {
  const examplePath = `${process.cwd()}/.dora.json`;
  loadFile(examplePath);
  const config = getConfig();

  console.log(JSON.stringify(config, null, 2));
});

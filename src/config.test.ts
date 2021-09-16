import { getConfig, loadConfig } from './config';

it('loadLocalConfig', () => {
  const examplePath = `${process.cwd()}/.dora.example.yml`;
  loadConfig(examplePath);
  const config = getConfig();

  console.log(JSON.stringify(config, null, 2));
});


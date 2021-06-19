import { loadLocalConfig } from '../config';

it('loadLocalConfig', () => {
  const examplePath = `${process.cwd()}/.dora.example.yml`;
  const conf = loadLocalConfig(examplePath);
});


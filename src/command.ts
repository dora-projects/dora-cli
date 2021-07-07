import { Command } from 'commander';
import chalk from 'chalk';

import Init from './cmd/init';
import backup from './cmd/backup';
import deploy from './cmd/deploy';
import genVersionTag from './cmd/tag';

export default function register(): void {
  const program = new Command();

  program
    .command('init')
    .description('generate dora cli configuration file')
    .action(async (options) => {
      await Init(options);
    });

  program
    .command('tag')
    .description('generates the version information file')
    .action(async (options) => {
      await genVersionTag(options);
    });

  program
    .command('backup')
    .description('backup build files')
    .action(async (options) => {
      await backup(options);
    });

  program
    .command('deploy')
    .description('deploy build file to test server')
    .action(async (options) => {
      await deploy();
    });

// program
//   .command("docker")
//   .description("打包到 docker 里，内置 nginx 的静态资源服务器")
//   .requiredOption("-d, --dir <string>", "打包后的文件 如: dist 或 build")
//   .requiredOption("-p, --port <string>", "镜像暴露的端口")
//   .action((options) => {
//     console.log(options);
//   });

  program
    .command('smu')
    .description('upload sourcemap to front end error monitoring system Dora')
    .action((options) => {
      console.log(options);
    });

  program
    .command('smr')
    .description('restore stack information')
    .requiredOption('-e, --error <string>', 'compressed error messages')
    .requiredOption('-f, --file <string>', 'sourcemap file absolute path')
    .action((options) => {
      console.log(options);
    });


// output help information on unknown commands
  program.on('command:*', ([cmd]) => {
    program.outputHelp();
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
    console.log();
    process.exitCode = 1;
  });

// add some useful info on help
  program.on('--help', () => {
    console.log();
    console.log(`  Run ${chalk.green(`dora <command> --help`)} for detailed usage of given command.`);
    console.log();
  });


  program.parse(process.argv);

}

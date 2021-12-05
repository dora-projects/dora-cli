import { Command } from 'commander';
import chalk from 'chalk';

import Init from './cmd/init';
import backup from './cmd/backup';
import deploy from './cmd/deploy';
import sourcemap from './cmd/sourcemap';
import genVersionTag from './cmd/tag';

export default function register(): void {
  const program = new Command();

  program
    .command('init')
    .description('generate dora cli configuration file')
    .action(async () => {
      await Init();
    });

  program
    .command('tag')
    .description('generates the version tag info file')
    .action(async () => {
      await genVersionTag();
    });

  program
    .command('backup')
    .description('backup build files')
    .action(async () => {
      await backup();
    });

  program
    .command('deploy')
    .option('-l, --labels [labels...]', 'output extra debugging')
    .description('deploy build file to test server')
    .action(async ({ labels }) => {
      await deploy(labels);
    });

  program
    .command('smu')
    .description('upload sourcemap to front end error monitoring system Dora')
    .action(async () => {
      await sourcemap();
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
    console.log(
      `  Run ${chalk.green(`dora <command> --help`)} for detailed usage of given command.`,
    );
    console.log();
  });

  program.parse(process.argv);
}

#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";

import backup from "./cmd/backup";
import genVersionTag from "./cmd/tag";

const program = new Command();

program
  .command("tag")
  .description("生成版本信息的代码文件, 可在项目 build 前使用，build 时打包进代码里")
  .option("-t, --tag <sting>", "git tag 内容")
  .requiredOption("-f, --filename <sting>", "生产的版本信息文件名 json 格式")
  .action(async (options) => {
    await genVersionTag(options);
  });

program
  .command("backup")
  .description("备份打包后的产物")
  .requiredOption("-a, --appId <string>", "应用唯一 id")
  .requiredOption("-u, --url <string>", "备份服务地址")
  .action((options) => {
    console.log(options);
    backup(options);
  });

program
  .command("sourcemap-upload")
  .description("上传 sourcemap 到前端错误监控系统")
  .requiredOption("-a, --appId <string>", "应用唯一 id")
  .requiredOption("-u, --url <string>", "备份服务地址")
  .action((options) => {
    console.log(options);
  });

program
  .command("deploy")
  .description("上传前端静态文件到服务器，先上传静态资源，最后覆盖 html")
  .requiredOption("-a, --appId <string>", "应用唯一 id")
  .requiredOption("-u, --url <string>", "备份服务地址")
  .option("-e, --excludeSourceMap <boolean>", "备份服务地址", true)
  .action((options) => {
    console.log(options);
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
  .command("sourcemap-restore")
  .description("还原出源码的堆栈，目前给 golang 程序调用")
  .requiredOption("-e, --error <string>", "压缩过得错误信息")
  .requiredOption("-f, --file <string>", "sourcemap 文件绝对路径")
  .action((options) => {
    console.log(options);
  });


// output help information on unknown commands
program.on("command:*", ([cmd]) => {
  program.outputHelp();
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  console.log();
  process.exitCode = 1;
});

// add some useful info on help
program.on("--help", () => {
  console.log();
  console.log(`  Run ${chalk.cyan(`dora <command> --help`)} for detailed usage of given command.`);
  console.log();
});


program.parse(process.argv);

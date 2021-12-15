# dora-cli

## 简介
cli 辅助工具，用于上传 sourcemap，生成版本信息等

## 安装
```shell
npm i @doras/cli -g
```

## 使用

```shell
Usage: dora [options] [command]

Options:
  -h, --help      display help for command

Commands:
  init            generate dora cli configuration file
  tag             generates the version tag info file
  backup          backup build files
  deploy          deploy build file to test server
  smu             upload sourcemap to front end error monitoring system Dora
  help [command]  display help for command

  Run dora <command> --help for detailed usage of given command.
```

### `dora init` 
生成配置文件

### `dora tag`
生成版本信息的代码文件，在项目中使用

### `dora smu`
上传 sourcemap 到错误监控系统，进行堆栈还原

### `dora backup`
备份打包产物

### `dora deploy`
同步到服务器上


## License

This project is licensed under the terms of the [MIT License](https://github.com/dora-projects/dora-server/blob/master/LICENSE).

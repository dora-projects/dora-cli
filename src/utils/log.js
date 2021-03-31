const dayJs = require("dayjs")
const chalk = require("chalk")
const log = console.log;


function time() {
  return dayJs().format("YYYY-MM-DD HH:mm:ss")
}

const timeColor = chalk.blue.bold;

const logger = {
  info: log.bind(console, timeColor`${time()}`, chalk.bold.green("[INFO]")),
  warn: log.bind(console, timeColor`${time()}`, chalk.bold.yellow("[WARN]")),
  error: log.bind(console, timeColor`${time()}`, chalk.bold.red("[ERROR]")),
}

module.exports = logger

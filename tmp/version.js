const { exec } = require("shelljs");

/**
 *  生成带有版本信息的js文件
 */
function version() {
  const t = exec(`TZ=Asia/Shanghai date +"%F %T %z" | tr -d "\\n"`, {
    silent: true,
  }).stdout;

  const tag = exec(`git describe --tags 2>/dev/null  | tr -d "\\n"`, {
    silent: true,
  }).stdout;

  const version = exec('git log --date=iso --pretty=format:"%cd @%H" -1', {
    silent: true,
  }).stdout;

  const sh = `cat <<EOF >version.temp.js
module.exports = {
  build: "${t}",
  tag: "${tag}",
  version: "${version}",
};
EOF`;

  exec(sh, { silent: false });
  exec(`cat version.temp.js`, { silent: false });
}

module.exports = version;

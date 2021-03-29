const path = require('path');
const { exec } = require('shelljs');

function rsync({ ip, user, build, remoteDir }) {
  const cwd = process.cwd()
  const buildDir = path.join(cwd, build)

  // rsync -avh --exclude={'*.html'} build root@122.12.2.2:/www
  console.log('--------------同步 静态资源------------------')
  exec(`rsync -avh --exclude={'*.html','*.map'} ${buildDir} ${user}@${ip}:${remoteDir}`, { silent: false });

  console.log('--------------同步 html文件------------------')
  exec(`rsync -avh --exclude='*.map' ${buildDir} ${user}@${ip}:${remoteDir}`, { silent: false });
}

module.exports = rsync

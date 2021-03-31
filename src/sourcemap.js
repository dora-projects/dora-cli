const fs = require("fs")
const path = require("path")
const { exec } = require('shelljs');
const dayjs = require('dayjs');
const logger = require('./utils/log');


function sourcemap({ appId, url }) {
  exec(`rm -rf .dora`, { silent: false })
  exec(`mkdir -p .dora/origin`, { silent: false })
  exec(`mkdir -p .dora/withoutSourcemap`, { silent: false })
  exec(`mkdir -p .dora/onlySourcemap`, { silent: false })

  logger.info('origin')
  console.log()
  exec(`rsync -avh  build .dora/origin`, { silent: false });
  console.log()
  logger.info('withoutSourcemap')
  console.log()
  exec(`rsync -avh --exclude='*.map' build .dora/withoutSourcemap`, { silent: false });
  console.log()
  logger.info('onlySourcemap')
  console.log()
  exec(`rsync -avh --include='*.map' --include="*/" --exclude="*" build .dora/onlySourcemap`, { silent: false });
  console.log()
  logger.info('准备上传中 sourcemap...')

  const t = dayjs().format("YYYYMMDD_HHmmss")

  let sh = `export f=${t}.sourcemap.tar.gz && echo $f && tar -zcf .dora/$f  -C .dora/onlySourcemap build`

  sh += `&& curl --location --request POST ${url} --form 'file=@'.dora/$f'' --form 'appId=${appId}'`

  exec(sh, { silent: false })

  logger.info('上传成功')
  console.log()
}

module.exports = sourcemap

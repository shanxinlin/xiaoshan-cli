import { Command } from 'commander'
// .vesion 表示可以使用 -V --version 参数查看当前SDK版本
// 我们直接使用 package.json 中的 version 即可
import { version } from '../package.json'
// 这里我们用 xiaoshan 当作我的指令名称
// 命令行中使用 xiaoshan xxx 即可触发
const program = new Command('xiaoshan')
import { create } from './command/create'

// 调用 version 的参数可以自定义
// .version(version, '-v --version')
program.version(version, '-v --version')

program
  .command('create')
  .description('创建一个新项目')
  .argument('[name]', '项目名称')
  .action((dirName: string) => {
    create(dirName)
    // if (dirName) {
    // } else {
    //   console.log(`create${dirName}`)
    // }
  })

program.parse()

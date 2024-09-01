import path from 'path'
import fs from 'fs-extra'

import { gt } from 'lodash'
import chalk from 'chalk'
import axios, { AxiosResponse } from 'axios'

import { select, input } from '@inquirer/prompts'
import { clone } from '../utils/clone'
import { name, version } from '../../package.json'

// import log from "../utils/log";

export interface TemplateInfo {
  name: string // 项目名称
  downloadUrl: string // 下载地址
  description: string // 项目描述
  branch: string // 项目分支
}
// 这里保存了我写好的预设模板
export const templates: Map<string, TemplateInfo> = new Map([
  [
    'Vite4-Vue3-Typescript-template',
    {
      name: 'admin-template',
      downloadUrl: 'https://gitee.com/shanxinlin/vue-system.git',
      description: 'Vue3技术栈开发模板',
      branch: 'master'
    }
  ],
  [
    'Vite4-template1',
    {
      name: 'admin-template',
      downloadUrl: 'https://gitee.com/shanxinlin/vue-system.git',
      description: 'Vue3技术栈开发模板',
      branch: 'master'
    }
  ]
])

export function isOverwrite(fileName: string) {
  console.warn(`${fileName}文件夹存在`)
  return select({
    message: '是否覆盖？',
    choices: [
      { name: '覆盖', value: true },
      { name: '取消', value: false }
    ]
  })
}

export const getNpmInfo = async (npmName: string) => {
  const npmUrl = `https://registry.npmjs.org/${npmName}`
  let res = {}
  try {
    res = await axios.get(npmUrl)
  } catch (error) {
    console.error(error)
  }
  return res
}

export const getNpmLatestVersion = async (name: string) => {
  const { data } = (await getNpmInfo(name)) as AxiosResponse
  return data['dist-tags'].latest
}

export const checkVersion = async (name: string, version: string) => {
  const latestVersion = await getNpmLatestVersion(name)
  const need = gt(latestVersion, version)
  if (need) {
    console.warn(`检查到xiaoshan最新版本： ${chalk.blackBright(latestVersion)}，当前版本是：${chalk.blackBright(version)}`)
    console.log(`可使用： ${chalk.yellow('npm install xiaoshan-cli@latest')}，或者使用：${chalk.yellow('xiaoshan update')}更新`)
  }
  return need
}

export async function create(prjName?: string) {
  // 我们需要将我们的 map 处理成 @inquirer/prompts select 需要的形式
  // 大家也可以封装成一个方法去处理
  const templateList = [...templates.entries()].map((item: [string, TemplateInfo]) => {
    const [name, info] = item
    return {
      name,
      value: name,
      description: info.description
    }
  })
  if (!prjName) {
    prjName = await input({ message: '请输入项目名称' })
  }

  // 如果文件夹存在则提示是否覆盖
  const filePath = path.resolve(process.cwd(), prjName)
  if (fs.existsSync(filePath)) {
    const run = await isOverwrite(prjName)
    if (run) {
      fs.remove(filePath)
    } else {
      return // 不覆盖直接结束
    }
  }

  // 检查版本更新
  await checkVersion(name, version)

  // 选择模板
  const templateName = await select({
    message: '请选择需要初始化的模板:',
    choices: templateList
  })

  // 下载模板
  const gitRepoInfo = templates.get(templateName)
  console.log(gitRepoInfo, prjName)
  if (gitRepoInfo) {
    await clone(gitRepoInfo.downloadUrl, prjName, ['-b', `${gitRepoInfo.branch}`])
  } else {
    // log.error(`${templateName} 模板不存在`)
  }
}

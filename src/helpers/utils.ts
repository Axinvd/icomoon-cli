import {isAbsolute, resolve} from 'path'
import {promises, statSync} from 'fs'

export const getAbsolutePath = (inputPath: string) => {
  let absoluteSelectionPath = inputPath
  if (!isAbsolute(inputPath)) {
    if (!process.env.PWD) {
      process.env.PWD = process.cwd()
    }
    absoluteSelectionPath = resolve(process.env.PWD, inputPath)
  }
  return absoluteSelectionPath
}

export const isDirectory = async (path: string) => {
  await promises.access(path)
  const stat = statSync(path)

  return stat.isDirectory()
}
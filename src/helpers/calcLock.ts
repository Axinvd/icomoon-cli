import {readJSONSync, statSync} from 'fs-extra'
import {basename} from 'path'
import {logger} from './logger'
import {IOptions} from '../interfaces'

type Lock = {[key: string]: number}

export const calcLock = (
  lockPath: string,
  icons: string[],
  mode: IOptions['mode'],
) => {
  let lock: Lock = {}
  try {
    lock = readJSONSync(lockPath)
  } catch (e) {
    logger.warn('Create new lock file')
  }
  let isNew = false
  const nextLock = icons.reduce((prev, curr) => {
    const stat = statSync(curr)
    const name = basename(curr)
    isNew ||= lock[name] != stat.mtimeMs
    prev[name] = stat.mtimeMs
    return prev
  }, mode == 'add' ? lock : {})

  return {isNew, nextLock}
}

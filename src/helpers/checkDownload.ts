import {pathExists} from 'fs-extra'
import {statSync} from 'fs'

const DEFAULT_TIMEOUT = 10000

export const checkDownload = (dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const interval = 1000
    let downloadSize = 0
    let timeCount = 0
    const timer = setInterval(async () => {
      timeCount += interval
      const exist = await pathExists(dest)
      if (!exist) {
        return
      }
      const stats = statSync(dest)
      if (stats.size > 0 && stats.size === downloadSize) {
        clearInterval(timer)
        resolve()
      } else {
        downloadSize = stats.size
      }
      if (timeCount > DEFAULT_TIMEOUT) {
        reject('Timeout when download file, please check your network.')
      }
    }, interval)
  })
}
import {copyFileSync, promises, writeFileSync} from 'fs'
import {basename, dirname, extname, join} from 'path'
import {logger} from './logger'
import {isDirectory} from './utils'

export const initSelection = async (selection: string) => {
  const selectionEmptyPath = join(__dirname, '../../selection-empty.json')
  let selectionPath: string
  try {
    if (await isDirectory(selection)) {
      const selectionJson = join(selection, 'icomoon.json')
      try {
        await promises.access(selectionJson)
      } catch (e) {
        copyFileSync(selectionEmptyPath, selectionJson)
        logger.warn('Created new config')
      }
      selectionPath = selectionJson
    } else {
      selectionPath = selection
    }
  } catch (e) {
    const selectionJson = selection + '.json'
    try {
      await promises.access(selectionJson)
      selectionPath = selectionJson
    } catch (e) {
      const parentName = basename(dirname(selection))
      try {
        if (await isDirectory(parentName)) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const initialConfig = require(selectionEmptyPath)
          const fontName = basename(selection).split('.')[0]
          const fontExt = extname(selection)
          selectionPath = fontExt == '.json' ? selection : selection + '.json'
          initialConfig.metadata.name = fontName
          initialConfig.preferences.fontPref.metadata.fontFamily = fontName
          writeFileSync(selectionPath, JSON.stringify(initialConfig))
          logger.warn('Created new config')
        } else {
          logger.error('Wrong selection path')
          process.exit(1)
        }
      } catch (e) {
        logger.error('Wrong selection path')
        process.exit(1)
      }
    }
  }

  return selectionPath
}
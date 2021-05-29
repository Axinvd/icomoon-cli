import {readJSONSync, writeJSONSync} from 'fs-extra'
import {extname, basename} from 'path'
import {IIcomoonConfig} from '../interfaces'

export const removeDuplicates = (selectionPath: string, icons: string[]) => {
  const iconNames = icons.map((icon) => {
    return basename(icon).replace(extname(icon), '')
  })
  const duplicates: {name: string; index: number}[] = []
  const selection = readJSONSync(selectionPath) as IIcomoonConfig
  selection.icons.forEach(({properties}, index) => {
    if (iconNames.includes(properties.name)) {
      duplicates.push({name: properties.name, index})
    }
  })
  if (duplicates.length) {
    selection.icons = selection.icons.filter(
      (icon, index) => !duplicates.some((d) => d.index === index),
    )
    writeJSONSync(selectionPath, selection, {spaces: 2})
  }
}

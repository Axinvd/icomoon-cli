import {basename, extname, join} from 'path'
import {copyFileSync, readdirSync, readFileSync, writeFileSync} from 'fs'
import {IIcomoonConfig, IRequired, ISplit} from '../interfaces'
import camelcase from 'camelcase'

export const splitData = ({
  output,
  selectionPath,
  outputNames,
  iconKeysCreator,
  outputFont,
}: IRequired & ISplit) => {
  const selectionResultPath = join(output, 'selection.json')
  copyFileSync(selectionResultPath, selectionPath)

  const selectionResult = JSON.parse(
    readFileSync(selectionResultPath).toString(),
  ) as IIcomoonConfig
  if (outputNames) {
    const names = selectionResult.icons.map(({properties: {name}}) => name)
    const content = (iconKeysCreator || initialIconKeysCreator)(names)
    writeFileSync(outputNames, content)
  }
  const fontPath = join(output, 'fonts')
  const fontFiles = readdirSync(fontPath)
  const fonts = fontFiles.reduce((prev, current) => {
    prev[extname(current).slice(1)] = join(fontPath, current)
    return prev
  }, {} as {[key: string]: string})
  outputFont?.forEach((item) => {
    const [path, fontType] = item.split(',')
    copyFileSync(fonts[fontType], join(path, basename(fonts[fontType])))
  })
}

function initialIconKeysCreator(names: string[]) {
  return (
    names
      //todo check on different os
      .sort((a, b) => a.localeCompare(b))
      .reduce((prev, name) => {
        return prev + `\n  ${camelcase(name)}: '${name}',`
      }, 'export const IconNames = {') + '\n}\n'
  )
}

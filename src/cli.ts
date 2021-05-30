import {Command} from 'commander'
import {join} from 'path'
import {tmpdir} from 'os'
import {glob} from 'glob'
import {readJSONSync, writeJSONSync} from 'fs-extra'
import {IIcomoonConfig, IOptions} from './interfaces'
import {pipeline} from './pipeline'
import {initSelection} from './helpers/initSelection'
import {calcLock} from './helpers/calcLock'
import {splitData} from './helpers/splitData'
import {logger} from './helpers/logger'
import {removeDuplicates} from './helpers/removeDuplicates'

export async function run({
  selection,
  visible,
  outputFont,
  outputNames,
  lock,
  mode,
  ...options
}: IOptions) {
  const icons = options.icons
    .map((path) => glob.sync(path))
    .reduce((prev, curr) => prev.concat(curr), [])
  if (!icons.length) {
    throw new Error('No new icons found.')
  }
  const {isNew, nextLock} = calcLock(lock, icons, mode)
  if (isNew) {
    const tempPath = join(tmpdir(), 'icomoon-cli')
    const selectionPath = await initSelection(selection)
    const output = options.output || tempPath
    if (mode == 'add') {
      await removeDuplicates(selectionPath, icons)
    } else {
      const selection = readJSONSync(selectionPath) as IIcomoonConfig
      selection.icons = []
      writeJSONSync(selectionPath, selection, {spaces: 2})
    }
    await pipeline({icons, selectionPath, visible, output})
    await splitData({output, selectionPath, outputFont, outputNames})
    writeJSONSync(lock, nextLock)
  } else {
    logger.log('Font is up to date')
  }
}

if (module.parent == null) {
  const program = new Command()

  program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require('../package.json').version)
    .option(
      '-s, --selection [string]',
      'path to icomoon selection file',
      './icomoon.json',
    )
    .option('-i, --icons <sting...>', 'path to icons need to be imported')
    .option(
      '-f, --outputFont [string...]',
      'output font path with type, separated by coma',
    )
    .option('-l, --lock [string]', 'path to lock file', './icomoon-lock.json')
    .option('-o, --output [string]', 'all icomoon generated files path')
    .option('-n, --outputNames [string]', 'path to icons const')
    .option('-v, --visible', 'run a GUI chrome instead of headless mode', false)
    .option('-m, --mode [string]', "mode 'add' or 'repository'", 'add')

  program.parse(process.argv)
  run(program.opts() as unknown as IOptions)
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(error)
      process.exit(1)
    })
}

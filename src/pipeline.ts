import path from 'path'
import extract from 'extract-zip'
import puppeteer from 'puppeteer'
import {ensureDir, readJSONSync, remove} from 'fs-extra'
import {checkDownload} from './helpers/checkDownload'
import {cancelOverlay} from './helpers/cancelOverlay'
import {IIcomoonConfig, IPipeline, IRequired} from './interfaces'
import {logger} from './helpers/logger'
import {getAbsolutePath} from './helpers/utils'

const PAGE = {
  IMPORT_CONFIG_BUTTON: '.file.unit',
  IMPORT_SELECTION_INPUT: '.file.unit input[type="file"]',
  OVERLAY_CONFIRM: '.overlay button.mrl',
  OVERLAY_BUTTON_ON_ADD: '.overlay button',
  OVERLAY_BUTTON_ON_LOAD: '.overlay button[ng-show="message.secondButton"]',
  NEW_SET_BUTTON: '.menuList1 button',
  MAIN_MENU_BUTTON: '.bar-top button .icon-menu',
  MENU_BUTTON: 'h1 button .icon-menu',
  MENU: '.menuList2.menuList3',
  ICON_INPUT: '.menuList2.menuList3 .file input[type="file"]',
  FIRST_ICON_BOX: '#set0 .miBox:not(.mi-selected)',
  REMOVE_SET_BUTTON: '.menuList2.menuList3 li:last-child button',
  SELECT_ALL_BUTTON: 'button[ng-click="selectAllNone($index, true)"]',
  GENERATE_LINK: 'a[href="#/select/font"]',
  GLYPH_SET: '#glyphSet0',
  GLYPH_NAME: '.glyphName',
  DOWNLOAD_BUTTON: '.btn4',
}

export const pipeline = async (options: IRequired & IPipeline) => {
  const {icons, selectionPath, visible = false} = options
  const outputDir = getAbsolutePath(options.output)
  // prepare stage
  logger.log('Preparing...')
  const absoluteSelectionPath = getAbsolutePath(selectionPath)
  await remove(outputDir)
  await ensureDir(outputDir)

  const width = 1024
  const height = 1600
  const browser = await puppeteer.launch({
    headless: !visible,
    defaultViewport: {width, height},
  })
  logger.log('Started a new chrome instance, going to load icomoon.io.')
  const page = await (await browser).newPage()

  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
  )
  await page.setViewport({width, height})

  await page['_client'].send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: outputDir,
  })
  await page.goto('https://icomoon.io/app/#/select')
  await page.waitForSelector(PAGE.IMPORT_CONFIG_BUTTON, {visible: true})
  logger.log('Dashboard is visible')

  logger.log('Removing placeholder set')
  await page.click(PAGE.MENU_BUTTON)
  await page.click(PAGE.REMOVE_SET_BUTTON)

  logger.log('Importing selection file')
  const importInput = await page.waitForSelector(PAGE.IMPORT_SELECTION_INPUT)
  await importInput!.uploadFile(absoluteSelectionPath)

  logger.log('Import selection confirmation')
  await page.waitForSelector(PAGE.OVERLAY_CONFIRM, {visible: true})
  await page.click(PAGE.OVERLAY_CONFIRM)

  const selectionJSON = readJSONSync(absoluteSelectionPath) as IIcomoonConfig
  if (selectionJSON.icons.length === 0) {
    logger.log('Selection icons is empty, going to create an empty set')
    await page.click(PAGE.MAIN_MENU_BUTTON)
    await page.waitForSelector(PAGE.NEW_SET_BUTTON, {visible: true})
    await page.click(PAGE.NEW_SET_BUTTON)
  }
  if (icons && icons.length) {
    logger.log('Uploaded selection, going to upload new icon files')
    await page.click(PAGE.MENU_BUTTON)
    const iconInput = await page.waitForSelector(PAGE.ICON_INPUT)
    const iconPaths = icons.map(getAbsolutePath)
    await iconInput!.uploadFile(...iconPaths)
    await page.waitFor(500)
    await cancelOverlay(page, PAGE.OVERLAY_BUTTON_ON_ADD)
    await page.waitForSelector(PAGE.FIRST_ICON_BOX)
    await page.click(PAGE.MENU_BUTTON)
    await page.waitForSelector(PAGE.SELECT_ALL_BUTTON, {visible: true})
    await page.click(PAGE.SELECT_ALL_BUTTON)
  }

  logger.log('Generating icons')
  await page.click(PAGE.GENERATE_LINK)
  await page.waitForSelector(PAGE.GLYPH_SET)

  await cancelOverlay(page, PAGE.OVERLAY_BUTTON_ON_LOAD)

  await page.waitForSelector(PAGE.DOWNLOAD_BUTTON)
  await page.click(PAGE.DOWNLOAD_BUTTON)
  const meta = selectionJSON.preferences.fontPref.metadata
  const zipName = meta.majorVersion
    ? `${meta.fontFamily}-v${meta.majorVersion}.${meta.minorVersion || 0}.zip`
    : `${meta.fontFamily}.zip`
  logger.log(`Started to download ${zipName}`)
  const zipPath = path.join(outputDir, zipName)
  await checkDownload(zipPath)
  logger.log('Successfully downloaded, going to unzip it.')
  await page.close()
  // unzip stage
  await extract(zipPath, {dir: outputDir})
  await remove(zipPath)
  logger.log('Finished.')
}

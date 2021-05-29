import {Page} from 'puppeteer'

export const cancelOverlay = async (page: Page, item: string) => {
  let warnings = false
  try {
    const handle = await page.waitForSelector(item, {
      visible: true,
      timeout: 2000,
    })
    if (handle) {
      await handle.click()
    } else {
      warnings = true
    }
    // eslint-disable-next-line no-empty
  } catch (error) {}
  if (warnings) {
    throw new Error(
      'Importing of icons gave a popup with warnings(eg. stroke used in svg), which means cli cannot do its magic.',
    )
  }
}

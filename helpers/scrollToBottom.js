module.exports = async (page, delay = 1000) => {
  try {
    let previousHeight = 0
    while (
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`,
        { timeout: 100 }
      )
    ) {
      previousHeight = await page.evaluate("document.body.scrollHeight")
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
      previousHeight = await page.evaluate("document.body.scrollHeight")
      await page.waitFor(delay)
    }
  } catch (error) {}
  try {
    await page.waitForFunction(`window.scrollTo(0,0)`, { timeout: 100 })
  } catch (error) {}
  return true
}

// import tools
const fs = require("fs")
const puppeteer = require("puppeteer")
const ora = require("ora")
const formatTime = require("date-fns/format")
const getCookie = require("./helpers/getCookie")
const saveItem = require("./helpers/saveItem")
const scrolltoBottom = require("./helpers/scrollToBottom")

// Returns an array of bookmark item objects
const scrape = async targetURL => {
  // start the spinner
  const spinner = ora("Booting up").start()

  // initialize the browser
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  // set login cookie
  const previousSession = fs.existsSync("./cookies.json")

  if (!previousSession) {
    spinner.text = "Getting Login Cookie"
    getCookie()
  }

  const cookiesArr = require("./cookies.json")
  if (cookiesArr.length !== 0) {
    for (let cookie of cookiesArr) {
      await page.setCookie(cookie)
    }
    // console.log("Login cookie has been loaded in the browser")
    spinner.text = "🍪 Login Cookie Loaded"
  }

  // Open a connection to the specified url
  spinner.text = "Opening Page"
  await page.goto(targetURL)
  await page.waitFor(2000)

  spinner.text = "Scrolling to bottom…"
  await scrolltoBottom(page)

  // click on the first grid item
  spinner.text = "Clicking the first grid item…"
  await page.click("div .grid-item")
  await page.waitForSelector(".fullscreenable")

  // click to expand info bar
  spinner.text = "Opening info bar…"
  const infoBarSelector = "li.actions li:nth-child(1n) button"
  await page.click(infoBarSelector)

  // Save content
  let content = []
  let moreLeft = true

  // while moreLeft is true
  do {
    // only considerer un-tagged items
    if ((await page.$(".tag")) === null) {
      try {
        let item = await saveItem(page)
        content.push(item)
        spinner.text = `Saved ${content.length}
        ${item.name}
        `
      } catch (error) {
        console.error(error)
      }
    }

    let prevURL = await page.url()
    await page.keyboard.press("ArrowRight")
    try {
      await page.waitForNavigation({ timeout: 1000 })
    } catch (e) {
      moreLeft = false
    }
  } while (moreLeft)

  // now we return the content array
  spinner.succeed(`${content.length} saved \n`)
  browser.close()
  return content
}

module.exports = scrape

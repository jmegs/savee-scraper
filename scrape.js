// import tools
// fs, netscape-bookmarks, puppeteer
const fs = require("fs")
// const download = require("image-downloader")
const puppeteer = require("puppeteer")
const ora = require("ora")
const creds = require("./creds")

const usernameSelector = "input[name='username']"
const passwordSelector = "input[name='password']"
const loginButtonSelector = ".submit"

// Logs into savee and writes the cookie to cookies.json
async function getCookie() {
  await page.goto("https://savee.it/you")
  await page.waitFor(2 * 1000)

  // Log in using information in ./creds.js
  // username: SAVEE USERNAME
  // password: PASSWORD
  await page.click(usernameSelector)
  await page.keyboard.type(creds.username)

  await page.click(passwordSelector)
  await page.keyboard.type(creds.password)

  await page.click(loginButtonSelector)

  await page.waitFor(3 * 1000)

  // get cookie
  const cookiesObject = await page.cookies()
  let json = JSON.stringify(cookiesObject)
  fs.writeFile("cookies.json", json, "utf-8", err => {
    if (err) throw err
    console.log("the file has been saved")
  })
  return true
}

function generateHTML(items, title) {
  // template header
  let headerHTML = `<!DOCTYPE NETSCAPE-Bookmark-file-1><META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8"><TITLE>${title}</TITLE><H1>${title}</H1><DL>`

  let itemsHTML = []
  items.map(item => {
    let htmlString = `<DT><A ${
      item.sourceURL ? `REFERRER=${item.sourceURL}` : ``
    } HREF="${item.imageURL}">${escapeHTML(item.name)}</A></DT>`
    itemsHTML.push(htmlString)
  })

  let footerHTML = `</DL>`

  const finalHTML = `${headerHTML}${itemsHTML.map(i => i)}${footerHTML}`
  return finalHTML
}

async function saveImage(url) {
  const dest = "./downloads"
  try {
    const { filename, image } = await download.image({
      url: url,
      dest: dest
    })
    console.log(filename)
  } catch (e) {
    throw e
  }
}

function escapeHTML(string) {
  return string
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Returns an array of bookmark item objects
async function scrape(targetURL) {
  // start the spinner
  const spinner = ora("Booting up").start()
  // initialize the browser
  const browser = await puppeteer.launch()
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
    spinner.text = "Login Cookie Loaded"
  }

  // Open a connection to the specified url
  spinner.text = "Opening Page"
  await page.goto(targetURL)
  await page.waitFor(2000)

  // click on the first grid item
  spinner.text = "Click"
  await page.click("div .grid-item")
  await page.waitForSelector(".fullscreenable")

  // click to expand info bar
  spinner.text = "Open info bar"
  const infoBarSelector = "li.actions li:nth-child(1n) button"
  await page.click(infoBarSelector)
  // await page.waitForSelector(".bar-info")

  // save info and move to next item
  const nextLinkSelector = "a.arrow.next"
  const imageSelector = ".large"
  const linkSelector = ".slide-img-container a"

  let content = []
  let count = 0
  let moreLeft = true

  do {
    // wait till the large image has loaded
    await page.waitForSelector(imageSelector)
    let item = await page.evaluate(() => {
      // Saves Stuff
      const imageSelector = ".large"
      const linkSelector = ".slide-img-container a"
      const nameSelector = ".bar-info-content .name"

      let name = document.querySelector(nameSelector).innerText
      let imageURL = document.querySelector(imageSelector).src
      let sourceURL
      if (document.querySelector(linkSelector) !== null) {
        sourceURL = document.querySelector(linkSelector).href
      }
      let result = { name: name, imageURL: imageURL, sourceURL: sourceURL }
      return result
    })
    // write to content
    content.push(item)
    count++
    spinner.text = `${count} saved`

    // check for link
    if ((await page.$(nextLinkSelector)) !== null) {
      // click it
      await page.click(nextLinkSelector).catch(err => console.log(err))
    } else {
      // say we're done
      moreLeft = false
    }
  } while (moreLeft)

  // now we return the content array
  spinner.succeed("Got them all")
  browser.close()
  return content
}

// Target URL is the first command line argument
const args = process.argv.slice(2)
const targetURL = args[0]
const collectionTitle = args[1]

scrape(targetURL).then(items => {
  const html = generateHTML(items, collectionTitle)
  fs.writeFileSync(`./output/${collectionTitle}.html`, html, "utf-8", err => {
    if (err) throw err
    console.log("the file has been saved")
  })
})

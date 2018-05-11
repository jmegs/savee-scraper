// import tools
// fs, netscape-bookmarks, puppeteer
const fs = require("fs")
// const download = require("image-downloader")
const puppeteer = require("puppeteer")
const spinner = require("ora")
const creds = require("./creds")

const usernameSelector = "input[name='username']"
const passwordSelector = "input[name='password']"
const loginButtonSelector = ".submit"

const args = process.argv.slice(2)
const targetURL = args[0]

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

// Returns an array of bookmark item objects

async function scrape(targetURL) {
  // initialize the browser
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // set login cookie
  const previousSession = fs.existsSync("./cookies.json")

  if (!previousSession) {
    getCookie()
  }

  const cookiesArr = require("./cookies.json")
  if (cookiesArr.length !== 0) {
    for (let cookie of cookiesArr) {
      await page.setCookie(cookie)
    }
    console.log("Login cookie has been loaded in the browser")
  }

  // Open a connection to the specified url
  await page.goto(targetURL)
  await page.waitFor(2000)

  // click on the first grid item
  await page.click("div .grid-item")
  await page.waitFor(2000)

  // click to expand info bar
  const infoBarSelector = "li.actions li:nth-child(1n) button"
  await page.click(infoBarSelector)
  await page.waitFor(2000)

  // save info and move to next item
  const nextLinkSelector = "a.arrow.next"
  const imageSelector = ".large"
  const linkSelector = ".slide-img-container a"

  let content = []
  let moreLeft = true

  do {
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

    // check for link
    if ((await page.$(nextLinkSelector)) !== null) {
      // click it
      await page.click(nextLinkSelector).catch(err => console.log(err))
      await page.waitFor(2000)
    } else {
      // say we're done
      moreLeft = false
    }
  } while (moreLeft)

  // now we return the content array
  browser.close()
  return content
}

function generateHTML(items) {
  // template header
  let headerHTML = `<!DOCTYPE NETSCAPE-Bookmark-file-1><META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8"><TITLE>Savee</TITLE><H1>Savee</H1><DL><p>`

  let itemsHTML = []
  items.map(item => {
    let htmlString = `<DT><A${
      item.sourceURL ? `REFERRER=${item.sourceURL}` : ``
    } HREF="${item.imageURL}">${item.name}</A>`
    itemsHTML.push(htmlString)
  })

  let footerHTML = `</DL></p>`

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

// netscape bookmark process the content object
// write that html to the disk
// getCookie("https://savee.it/you")
scrape(targetURL).then(result => {
  console.log(generateHTML(result))
})

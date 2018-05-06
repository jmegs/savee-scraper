// import tools
// fs, netscape-bookmarks, puppeteer
const fs = require("fs")
const download = require("image-downloader")
const puppeteer = require("puppeteer")
const netscape = require("netscape-bookmarks")
const creds = require("./creds")

const usernameSelector = "input[name='username']"
const passwordSelector = "input[name='password']"
const loginButtonSelector = ".submit"

const getCookie = async targetURL => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(targetURL)
  await page.waitFor(2 * 1000)

  // Log in using information in ./creds.js
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

const scrape = async targetURL => {
  // initialize the browser
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  // set login cookie
  const previousSession = fs.existsSync("./cookies.json")
  if (previousSession) {
    // if file exists load the cookies
    const cookiesArr = require("./cookies.json")
    if (cookiesArr.length !== 0) {
      for (let cookie of cookiesArr) {
        await page.setCookie(cookie)
      }
      console.log("Login cookie has been loaded in the browser")
    }
  }

  // Open a connection to the specified url
  await page.goto(targetURL)
  await page.waitFor(2 * 1000)

  // click on the first grid item
  await page.click("div .grid-item")
  await page.waitFor(2000)

  // click to expand info bar
  const infoBarSelector = "li.actions li:nth-child(1n) button"
  await page.click(infoBarSelector)
  await page.waitFor(1000)

  // save info and move to next item
  const nextLinkSelector = "a.arrow.next"
  const imageSelector = ".large"
  const linkSelector = ".slide-img-container a"

  let content = {}
  let moreLeft = true

  do {
    let data = await page.evaluate(() => {
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
      let info = { name: name, imageURL: imageURL, sourceURL: sourceURL }
      return info
    })
    // write to content
    content[escapeHTML(data.name.toString())] = {
      url: data.sourceURL,
      image: data.imageURL
    }

    // check for link
    if ((await page.$(nextLinkSelector)) !== null) {
      // click it
      await page.click(nextLinkSelector).catch(err => console.log(err))
      await page.waitFor(2000)
    } else {
      moreLeft = false
    }
  } while (moreLeft)

  // now we have the content object
  // push to content object
  browser.close()
  return content
}

// netscape bookmark process the content object
// write that html to the disk
// getCookie("https://savee.it/you")
scrape("https://savee.it/collections/dashboard-information/").then(
  async content => {
    Object.keys(content).map(key => {
      saveImage(content[key].image)
    })
  }
)

function escapeHTML(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function slugify(string) {
  return string.replace(/^\/|\/$/g, "").replace(/\//g, "-")
}

function generateHTML(items) {
  // template header
  let headerHTML = `<!DOCTYPE NETSCAPE-Bookmark-file-1> <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8"> <TITLE>Bookmarks</TITLE><H1>Bookmarks</H1><DL><p>`

  let itemsHTML = []
  for (const key in items) {
    let htmlString = `<DT><A ${
      items[key].url ? `HREF=${items[key].url}` : ``
    } IMAGE="${items[key].image}">${key}</A>`
    itemsHTML.push(htmlString)
  }

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

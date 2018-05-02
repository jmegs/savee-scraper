// import tools
// fs, netscape-bookmarks, puppeteer
const fs = require("fs")
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

  if (page.$(nextLinkSelector)) {
    let data = await page.evaluate(() => {
      const imageSelector = ".large"
      const linkSelector = ".slide-img-container a"
      const nameSelector = ".bar-info-content .name"

      let name = document.querySelector(nameSelector).innerText
      let imageURL = document.querySelector(imageSelector).src
      let sourceURL
      if (linkSelector) {
        sourceURL = document.querySelector(linkSelector).href
      }
      let info = { name: name, imageURL: imageURL, sourceURL: sourceURL }
      return info
    })

    content[data.name.toString()] = {
      url: data.sourceURL,
      image: data.imageURL
    }
  }

  console.log(content)

  // save to an object
  // push to content object

  // if there's a next link, click the next link
  // otherwise, return the content object and close the browser
  // return that value
}

// netscape bookmark process the content object
// write that html to the disk

scrape("https://savee.it/collections/recreate/")
// getCookie("https://savee.it/you")

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

/* end of saveItem */
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
  const nameSelector = ".bar-info-content .name"
  await page.click(infoBarSelector)
  await page.waitForSelector(nameSelector)

  // save info and move to next item
  const nextLinkSelector = "a.arrow.next"
  const imageSelector = ".large"
  const linkSelector = ".slide-img-container a"

  // Get the name from the info bar
  let name = await page.evaluate(selector => {
    return document.querySelector(selector).innerText
  }, nameSelector)

  // Get the image url from the large image tag
  let imageURL = await page.evaluate(selector => {
    return document.querySelector(selector).src
  }, imageSelector)

  // If there's a source URL, get the source URL
  let sourceURL = await page.evaluate(selector => {
    if (selector) {
      return document.querySelector(selector).href
    }
  }, linkSelector)

  console.log({
    name: name,
    imageURL: imageURL,
    sourceURL: sourceURL
  })

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

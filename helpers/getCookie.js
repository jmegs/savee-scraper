const fs = require("fs")
const puppeteer = require("puppeteer")
const creds = require("../creds")

const usernameSelector = "input[name='username']"
const passwordSelector = "input[name='password']"
const loginButtonSelector = ".submit"

// Logs into Savee with puppeteer and writes an auth cookie to cookies.json
const getCookie = async () => {
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
    console.log("🍪 Saved Cookie File")
  })
  return true
}

module.exports = getCookie

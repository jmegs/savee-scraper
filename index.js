const generateHTML = require("./helpers/generateHTML")
const getCookie = require("./helpers/getCookie")
const scrape = require("./scrape")
const fs = require("fs")

// Target URL is the first command line argument
// Collection title is the second
const args = process.argv.slice(2)
const targetURL = args[0]
const collectionTitle = args[1]

scrape(targetURL).then(items => {
  const html = generateHTML(items, collectionTitle)
  fs.writeFileSync(`./output/${collectionTitle}.html`, html, "utf-8", err => {
    if (err) throw err
    console.log(`👍 File saved to output/${collectionTitle}.html`)
  })
})

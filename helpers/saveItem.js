const slugify = require("slugify")
const formatTime = require("date-fns/format")

const nextLinkSelector = "a.arrow.next"
const imageSelector = ".large"
const linkSelector = ".slide-img-container a"
const nameSelector = ".bar-info-content .name"
const dateSelector = ".date"
const tagSelector = ".tag"

module.exports = async page => {
  let item = {}
  try {
    await page.waitForSelector(imageSelector)

    // Save slugified name
    let url = await page.url()
    let nameString = url
      .split("/i")
      .pop()
      .replace(/\//g, ``)
    item.name = nameString

    // save image url
    let imageURL = await page.$eval(imageSelector, el => el.src)
    item.imageURL = imageURL

    // Save the date as a unix timestamp
    let dateString = await page.$eval(dateSelector, el => el.innerText)

    if (!dateString.includes(",")) {
      dateString = `${dateString}, 2018`
    }

    item.dateAdded = formatTime(dateString, "x")

    // if there's a source URL, save that too
    if ((await page.$(linkSelector)) !== null) {
      let sourceURL = await page.$eval(linkSelector, el => el.href)
      item.sourceURL = sourceURL
    } else {
      item.sourceURL = "https://savee.it/jmegs"
    }
  } catch (error) {
    console.error(error)
  }
  return item
}

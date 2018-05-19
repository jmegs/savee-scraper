// outputs a Netscape bookmark file formatted string of HTML given an array of items and a collection name.
const generateHTML = (items, collection) => {
  // returns an array of html strings
  let itemsHTML = items.map(item => {
    let { name, imageURL, sourceURL, dateAdded } = item
    let sourceString = `HREF=""`
    if (sourceURL) {
      sourceString = `HREF="${sourceURL}"`
    }
    let html = `
      <DT>
        <A
          ${sourceString}
          CONTENT="${imageURL}"
          ADD_DATE="${dateAdded}">
          ${name}
        </A>
      </DT>
    `
    return html
  })

  let output = `
  <!DOCTYPE NETSCAPE-Bookmark-file-1>
  <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
  <TITLE>Dropmark Import</TITLE>

  <H1>${collection}</H1>
  <DL>
    ${itemsHTML.join("\r\n")}
  </DL>
  `
  return output
}

module.exports = generateHTML

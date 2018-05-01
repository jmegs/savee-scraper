// import tools
// fs, netscape-bookmarks, puppeteer 



// create an empty array for the content

/*
// function: saveItem
// grabs pertinent information and saves to content array
// run this on each item page
*/

// Create an empty object called item

// Grab the large image on the page document.querySelector(".large")
// and store it in a variable image


// Check if there is a link at document.querySelector(".slide-img-container a")
// If the link != null, store the href as a variable source_url

// push the item object into the global content array

/* end of saveItem */


/*
// Do the Scraping
*/

// open a connection to the a specified URL savee.it/you || collection URL


// click on the first ".grid-item"

// Check if a next button still exists 
// document.querySelector("a.arrow.next") != null

// run the saveItem function

// when saveItem is finished, click the next button 
// document.querySelector("a.arrow.next")

// run the content array through netscape-bookmarks

// write the resulting html to a file.
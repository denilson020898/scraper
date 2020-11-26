const cheerio = require('cheerio');
const superagent = require('superagent');
const fs = require('fs');

// baseUrl for scraping
const baseUrl = "https://www.cermati.com/artikel";

// prefix => "https://www.cermati.com/"
// This is needed because the HTML parser gets the links without the domain URI.
let splitted = baseUrl.split("/");
const prefix = splitted[0] + "//" + splitted[2];


// Request to the baseUrl
superagent
    .get(baseUrl)
    .then(res => {
        // * Retrieve the response then load it into the cheerio parser.
        // * Parse the HTML response, then query and element with class "list-of-articles"
        //   which points to the desired children. The children _IS_ "article-list-item".
        // * For each of the child, query the desired URL then construct a complete url,
        //   Push it into an empty array.
        // * Return that array for the next Promise handler.
        const $ = cheerio.load(res.text);

        let articleUrls = [];

        $(".list-of-articles").each((i, el) => {
            $(el).find(".article-list-item").each((i, el) => {
                const url = (prefix + $(el).find("a").attr("href")).trim();
                articleUrls.push(url);
            })
        })

        return articleUrls;
    })
    .then(urls => {
        // * For each article URL, send a request. These requests return back promises.
        // * Maps all the promises process into a single promise.
        //   It executes all the mapped promises in parallel and waiting for them to complete.
        //   It block other call from joining the event queue.
        const promises = urls.map(url => superagent.get(url));
        // * Wait for all promises to complete then return the response
        return Promise.all(promises);
    })
    .then(responses => {
        // Pull the desired information from the reponses.
        let jsonDataList = [];
        for (const response of responses) {
            // Get the URL, Title, Author,and Posting Date for each article
            const $ = cheerio.load(response.text);
            const url = $(".OUTBRAIN").attr("data-src");
            const title = $(".post-title").text().trim();
            const author = $(".author-name").text().trim();
            const postingDate = $(".post-date").text().trim();

            var relatedArticles = [];

            // Get the Related Article which contains an array of URL and Title
            $(".panel-header:contains('Artikel Terkait')").next().each((i, el) => {
                $(el).find("li").each((i, el) => {
                    const url = (prefix + $(el).find("a").attr("href").trim()).trim();
                    const title = $(el).find(".item-title").text().trim()

                    let relatedData = {
                        url,
                        title
                    }
                    relatedArticles.push(relatedData)
                });
            });

            // Construct the data with the required format.
            let jsonData = {
                url,
                title,
                author,
                postingDate,
                relatedArticles
            };
            jsonDataList.push(jsonData);
        }
        return jsonDataList
    })
    .then(values => {
        // Push all the data into an object called "articles".
        var scrapedData = {
            articles: []
        };
        for (const value of values) {
            scrapedData.articles.push(value)
        }
        return scrapedData;
    })
    .then(data => {
        // Write the json data synchronously with 2 space padding to a file that
        // matches the JavaScript file name.
        const filename = __filename.split(/[\\/]/).pop().split(".")[0];
        fs.writeFileSync(filename + ".json", JSON.stringify(data, null, "  "));
    })
    .catch(err => {
        // Handle all error here.
        console.log("scraping error: ", err);
    });
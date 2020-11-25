const cheerio = require('cheerio');
const superagent = require('superagent');
// const fs = require('fs');
// const writeStream = fs.createWriteStream("solution.json");

const baseUrl = "https://www.cermati.com/artikel";
let splitted = baseUrl.split("/");
const prefix = splitted[0] + "//" + splitted[2];

// var articles = { articles: [] };
// writeStream.write(JSON.stringify(articles, null, "  "));

superagent
    .get(baseUrl)
    .then(res => {
        const $ = cheerio.load(res.text);

        $(".list-of-articles").each((i, el) => {
            $(el).find(".article-list-item").each((i, el) => {
                const url = (prefix + $(el).find("a").attr("href")).trim();

                superagent
                    .get(url)
                    .then(res => {
                        const $ = cheerio.load(res.text);
                        const title = $(".post-title").text().trim();
                        const author = $(".author-name").text().trim();
                        const postingDate = $(".post-date").text().trim();

                        // const relatedArticlesList = $("")

                        var json = {
                            url,
                            title,
                            author,
                            postingDate,
                        }
                        console.log(json)
                        // writeStream.write(JSON.stringify(json, null, "        "));
                        // writeStream.write(",\n");

                        // console.log(url, title, author, postingDate);
                    });

            });
        });


    })
    .catch(err => {
        console.log('scraping error: ', err);
    });
const cheerio = require('cheerio');
const superagent = require('superagent');
const fs = require('fs');

const baseUrl = "https://www.cermati.com/artikel";
let splitted = baseUrl.split("/");
const prefix = splitted[0] + "//" + splitted[2];


superagent
    .get(baseUrl)
    .then(res => {
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
        const promises = urls.map(url => superagent.get(url));
        return Promise.all(promises);
    })
    .then(responses => {
        let jsonDataList = [];
        for (const response of responses) {

            const $ = cheerio.load(response.text);
            const url = $(".OUTBRAIN").attr("data-src");
            const title = $(".post-title").text().trim();
            const author = $(".author-name").text().trim();
            const postingDate = $(".post-date").text().trim();

            var relatedArticles = [];

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
        var scrapedData = {
            articles: []
        };
        for (const value of values) {
            scrapedData.articles.push(value)
        }
        return scrapedData;
    })
    .then(data => {
        const filename = __filename.split(/[\\/]/).pop().split(".")[0];
        fs.writeFileSync(filename + ".json", JSON.stringify(data, null, "  "));
    })
    .catch(err => {
        console.log("scraping error: ", err);
    });
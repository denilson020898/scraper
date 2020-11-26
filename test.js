const cheerio = require('cheerio');
const { saveCookies } = require('superagent');
const superagent = require('superagent');
// const fs = require('fs');
// const writeStream = fs.createWriteStream("solution.json");

const baseUrl = "https://www.cermati.com/artikel";
let splitted = baseUrl.split("/");
const prefix = splitted[0] + "//" + splitted[2];


superagent
    .get(baseUrl)
    .then(res => {
        const $ = cheerio.load(res.text);
        console.log(1)
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


            let jsonData = {
                url,
                title,
                author,
                postingDate
            };
            jsonDataList.push(jsonData)
        }
        return jsonDataList
    })
    .then(values => {
        var scrapedData = {
            articles: []
        };
        for (const value in values) {
            console.log(value)
            scrapedData.articles.push(value)
        }
        console.log(2)
    })
    .catch(err => {
        console.log("scraping error: ", err);
    });
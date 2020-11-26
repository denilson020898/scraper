const Promise = require("bluebird");
const cheerio = require("cheerio");
const superagent = require("superagent");
const fs = require("fs");

const BASE_URL = "https://www.cermati.com/artikel";

superagent
    .get(BASE_URL)
    .then(res => {
        // console.log(res.text)
        const $ = cheerio.load(res.text);
        // console.log($(".article-list-item")[0].children[1].attribs.href)
        let art = $(".article-list-item");

        let prefix = BASE_URL.split("/")

        let urls = []

        for (i = 0; i < art.length; i++) {
            urls.push(prefix[0] + "//" + prefix[2] + art[i].children[1].attribs.href.trim());
        }
        // console.log(urls)

        let data = []

        urls.forEach(element => {
            superagent.get(element).then(res => {
                const $ = cheerio.load(res.text);
                let title = $(".post-title")[0].children[0].data.trim();
                let author = $(".author-name")[0].children[0].data.trim();
                let postingDate = $(".post-date")[0].children[1].children[0].data.trim();

                // let relatedTitle =

                // let relatedArticle = $(".side-list-panel")[0].children[3].children[1].children[1];
                // console.log(relatedArticle);
                let relatedArticleList = $(".side-list-panel")[0].children[3].children;
                let relatedArticle = [];

                for (i = 1; i < relatedArticleList.length; i += 2) {
                    // console.log(relatedArticle[i]);
                    let url = relatedArticleList[i].children[1].attribs.href.trim();
                    let title = relatedArticleList[i].children[1].children[1].children[0].data.trim();
                    relatedArticle.push([prefix[0] + "//" + prefix[2] + url, title]);
                }
                data.push(element, title, author, postingDate, relatedArticle);
            })
        });
    })

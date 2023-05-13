const axios = require('axios');
const articleExtractor = require('@extractus/article-extractor')

const url = 'https://www.pymnts.com/news/retail/2023/will-consumers-pay-50-for-drugstore-brand-sunscreen/';

exports.articleExtractor = async url => {
    try {
        const article = await articleExtractor.extract(url)
        console.log(article)
      } catch (err) {
        console.error(err);
        return false;
      }

    return article;
}

exports.articleExtractor(url);
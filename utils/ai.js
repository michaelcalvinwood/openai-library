const debug = false;

require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const fsPromises = require('fs').promises;
const nlp = require('./nlp');

const { Configuration, OpenAIApi } = require("openai");

const openAIModels = [
    {
        id: 'gpt-3.5-turbo',
        maxTokens: '4k'
    },
    {
        id: 'gpt-4',
        maxTokens: '8k'
    },
    {
        id: 'gpt-3.5-turbo-16k',
        maxTokens: '16k'
    },
    {
        id: 'gpt-4-32k',
        maxTokens: '32k'
    }
]


const configuration = new Configuration({
    apiKey: process.env.PYMNTS_OPENAI_KEY,
  });
const openai = new OpenAIApi(configuration);
const sleep = seconds => new Promise(r => setTimeout(r, seconds * 1000));

/*
 * top_p: what percentage of the top tokens to consider when formulating an answer
 *      Default: 1
 *      0.3 means only consider the top 30% by mass // should not use less than this
 * temperature: Adjusts the way that remaining tokens are handle (the tokens that remain after top_p is applied)
 *      1: The percentage chance of a token being selected is proportional to its probability of matching the query
 *      0: Only the top most token will be chosen. A lower setting than 1 increasingly excludes lower probability tokens from being selected.
 *      0.9: Great for creative applications; whereas 0 is good for greater accuracy
 *      2: Now every token has an equal probability score, meaning that every token has an equal chance of being selected
 * n: The number of responses that you want.
 *      Important: Make sure the temperature is not at 0 otherwise all the responses will be the same
 */

exports.openAIGenericChatCompletion = async (prompt, model, temperature = .9, top_p = 1, service = 'You are a helpful assistant', maxRetries = 10) => {
    const request = {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.PYMNTS_OPENAI_KEY}`,
        },
        data: {
            model,
            temperature,
            top_p,
            messages:[
                {
                    role: 'system',
                    content: service,

                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        }
    }

    let success = false;
    let count = 0;
    let seconds = 3;

    while (!success) {
        try {
            result = await axios(request);
            success = true;
        } catch (err) {
            console.error("axios err.data", err.response.status, err.response.statusText);
            ++count;
            if (count >= maxRetries || (err.response.status >= 400 && err.response.status <= 499) ) {
                console.log("STATUS 400 EXIT");
                return {
                    status: 'error',
                    number: err.response.status,
                    message: err.response.statusText,
                }
            }
            seconds *= 2;
            console.error(`${model} is busy. Sleeping now.`)
            await sleep(seconds);
            console.error(`Retrying query for ${model}`);
        }
    }

    const response = {
        status: 'success',
        finishReason: result.data.choices[0].finish_reason,
        content: result.data.choices[0].message.content
    }

    if (debug) console.log(response);

    return response;
}

async function turboChatCompletion (prompt, temperature = 0, service = 'You are a helpful, accurate assistant.') {
    /* 
     * NO NEED TO SPECIFY MAX TOKENS
     * role: assistant, system, user
     */

    const request = {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.PYMNTS_OPENAI_KEY}`,
        },
        data: {
            model: "gpt-3.5-turbo-16k",
            temperature,
            messages:[
                {
                    role: 'system',
                    content: service,

                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        }
    }

    console.log(request);

    return axios(request);
}

exports.getTurboResponse = async (prompt, temperature = 0, debugMe = false, service = 'You are a helpful, accurate assistant.') => {
    if (debug) console.log('TURBO', prompt);

    if (!prompt.endsWith("\n")) prompt += "\n";

    let result;
    let success = false;
    let count = 0;
    let seconds = 3;
    let maxCount = 10;
    while (!success) {
        try {
            result = await turboChatCompletion(prompt, temperature, service);
            success = true;
        } catch (err) {
            console.error("axios err.data", err.response.status, err.response.statusText, err.response.data);
            ++count;
            if (count >= maxCount || err.response.status === 400) {
                console.log("STATUS 400 EXIT");
                return {
                    status: 'error',
                    number: err.response.status,
                    message: err.response,
                }
            }
            seconds *= 2;
            await sleep(seconds);
            console.log('Retrying query:', prompt);
        }
    }

    const response = {
        status: 'success',
        finishReason: result.data.choices[0].finish_reason,
        content: result.data.choices[0].message.content
    }

    if (debug) console.log(response);

    return response;
}


async function gpt4Completion (prompt, temperature = 0, service = 'You are a helpful, accurate assistant.') {
    /* 
     * NO NEED TO SPECIFY MAX TOKENS
     * role: assistant, system, user
     */

    const request = {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.PYMNTS_OPENAI_KEY}`,
        },
        data: {
            model: "gpt-4",
            temperature,
            messages:[
                {
                    role: 'system',
                    content: service,

                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        }
    }

    return axios(request);
}

exports.getGPT4Response = async (prompt, temperature = 0, debugMe = false, service = 'You are a helpful, accurate assistant.') => {
    if (debug) console.log('TURBO', prompt);

    if (!prompt.endsWith("\n")) prompt += "\n";

    let result;
    let success = false;
    let count = 0;
    let seconds = 3;
    let maxCount = 10;
    while (!success) {
        try {
            result = await gpt4Completion(prompt, temperature, service);
            success = true;
        } catch (err) {
            console.error("axios err.data", err.response.status, err.response.statusText, err.response.data);
            ++count;
            if (count >= maxCount || err.response.status === 400) {
                console.log("STATUS 400 EXIT");
                return {
                    status: 'error',
                    number: err.response.status,
                    message: err.response,
                }
            }
            seconds *= 2;
            await sleep(seconds);
            console.log('Retrying query:', prompt);
        }
    }

    const response = {
        status: 'success',
        finishReason: result.data.choices[0].finish_reason,
        content: result.data.choices[0].message.content
    }

    if (debug) console.log(response);

    return response;
}

const testMe = async () => {
    const result = await exports.openAIGenericChatCompletion('What color is the sky?', openAIModels[3].id);
    console.log(result);
}

//testMe();


exports.getDivinciResponse = async (prompt, output = 'text', temperature = .7, debugMe = false) => {
    const numPromptTokens = nlp.numGpt3Tokens(prompt);

    if (debugMe) console.log('DIVINCI PROMPT', numPromptTokens, prompt);

    const request = {
        url: 'https://api.openai.com/v1/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.PYMNTS_OPENAI_KEY}`,
        },
        data: {
            model: "text-davinci-003",
            prompt,
            max_tokens: 4000 - numPromptTokens,
            temperature
        }
    }

    let response;
    let success = false;
    let count = 0;
    let seconds = 3;
    let maxCount = 10;

    while (!success) {
        try {
            response = await axios(request);
            if (debugMe) console.log(response.data);
            success = true;
            
        } catch (err) {
            console.error("axios err.data", err.response.status, err.response.statusText, err.response.data);
            ++count;
            if (count >= maxCount || err.response.status === 400) {
                console.log("STATUS 400 EXIT");
                return false;
            }
            seconds *= 2;
            await sleep(seconds);
            console.log('Retrying query:', prompt);
        }
    }

    if (output === 'text') return response.data.choices[0].text.replaceAll('“', '"').replaceAll('”', '"');

    let json;
    try {
        json = JSON.parse(response.data.choices[0].text.replaceAll("\n", "").replaceAll('“', '"').replaceAll('”', '"'));
    } catch (err) {
        return false;
    }

    return json;
}



const dTest = async () => {
    prompt = `"""Below is some Content and FactLinks. Using 692 words, rewrite the content using HTML by incorporating 5 FactLinks verbatim, as-is.
  
    [Format Guide: Use headings, subheadings, tables, bullet points, paragraphs, links, and bold to organize the information. There must be a minimum of 5 FactLinks included.] 
    
    Content:
    Inflation has been a major concern for American voters and the Biden administration, but there is finally some good news on the horizon. According to the U.S. Bureau of Labor Statistics, inflation slowed in May to the lowest rate in two years, largely due to declining prices for energy such as gasoline and electricity. The consumer price index increased 4% in May relative to a year earlier, a slowdown from 4.9% in April. 
  
  One of the most significant categories in the consumer price index is housing, which accounts for more than a third of the CPI weighting, the most of any other consumer good or service. Housing inflation has been stubbornly high for months, but economists believe it has peaked and is on the precipice of a reversal. Price changes in "shelter" were generally muted before the pandemic, but Covid-19 warped that dynamic: Housing costs shot up but have slowed and even started to fall in some areas, economists said. 
  
  While shelter is still playing a big role in inflation, it should be slowing in the second half of the year. In May, shelter prices rose 0.6%, up from 0.4% in April. They're up 8% in the past year. Monthly prices for used cars and trucks, motor vehicle insurance, apparel, personal care, and education also increased notably in May, according to the BLS. When measuring increases over the past year, notable categories include motor vehicle insurance, which saw prices jump by 17.1%, recreation (4.5%), household furnishings and operations (4.2%), and new vehicles (4.7%). 
  
  Aside from energy, many consumer categories also deflated from April to May, including airline fares, communication, new vehicles, and recreation, according to the BLS. Over the past year, there was deflation in categories such as airline fares, car and truck rentals, citrus fruits, fresh whole milk, and used cars and trucks. 
  
  Inflation is still high enough to concern the Federal Reserve, but drops in food and fuel prices might explain why consumers have lowered their forecast for where they expect inflation to be in the short term. The New York Fed reported that consumer expectations for inflation a year from now have declined. However, prices are still much higher than they were before the pandemic, and other economic headwinds remain on the horizon, including stubbornly high shelter inflation, increasingly restrictive monetary policy, as well as the possibility of a recession. 
  
  The May PPI report is the second piece of good inflation news in a two-day span: On Tuesday, the Producer Price Index showed that annual price increases seen by producers measured 1.1% for the 12 months ended in May, easing sharply from the 2.3% bump recorded in April. Driven by a decline in energy prices and food prices, this inflation measure has now decelerated for 11 consecutive months. It’s now at its lowest annual reading since December 2020, when post-pandemic demand was starting to return and producer prices were beginning their upward inflationary march. 
  
  Overall, while inflation is still a concern, there are signs that it may be easing. This is good news for consumers and the Biden administration, as high inflation can be a burden on many people. The Federal Reserve is expected to pause after more than a year of interest rate hikes, but they may not be done for good since inflation remains elevated. If inflation can get under 4% and closer to 2%, the White House and the Biden campaign would be on stronger footing. However, they will have to be careful since they have a credibility problem coming out of the beginning of inflation.
    
    FactLinks:
    <a href="https://www.bloomberg.com/news/newsletters/2023-06-13/inflation-is-easing-that-s-good-news-for-consumers-and-biden" target="_blank">INFLATION</a> IS EASING. THAT'S GOOD NEWS FOR CONSUMERS AND BIDEN
  After soaring last year, <a href="https://www.bloomberg.com/news/newsletters/2023-06-13/inflation-is-easing-that-s-good-news-for-consumers-and-biden" target="_blank">egg prices</a> saw a big drop
  Finally, some good news on inflation for <a href="https://www.bloomberg.com/news/newsletters/2023-06-13/inflation-is-easing-that-s-good-news-for-consumers-and-biden" target="_blank">American voters</a> — and by extension, Joe Biden.
  Housing is perhaps the most consequential category in the <a href="https://www.cnbc.com/2023/06/14/housing-inflation-will-almost-surely-fall-soon-say-economists.html" target="_blank">consumer price index</a>, a key inflation barometer.
  As the largest expense for an average <a href="https://www.cnbc.com/2023/06/14/housing-inflation-will-almost-surely-fall-soon-say-economists.html" target="_blank">U.S. household</a>, shelter accounts for more than a third of the CPI weighting, the most of any other consumer good or service.
  <a href="https://www.cnbc.com/2023/06/14/housing-inflation-will-almost-surely-fall-soon-say-economists.html" target="_blank">Housing inflation</a> has been stubbornly high for months, according to CPI data.
  Inflation slowed in May to the lowest rate in two years, largely on the back of declining prices for energy such as gasoline and electricity, the <a href="https://www.cnbc.com/2023/06/13/heres-the-inflation-breakdown-for-may-2023-in-one-chart.html" target="_blank">U.S. Bureau of Labor Statistics</a> said Tuesday.
  The <a href="https://www.cnbc.com/2023/06/13/heres-the-inflation-breakdown-for-may-2023-in-one-chart.html" target="_blank">consumer price index</a> increased 4% in May relative to a year earlier, a slowdown from 4.9% in April.
  <a href="https://www.cnbc.com/2023/06/13/heres-the-inflation-breakdown-for-may-2023-in-one-chart.html" target="_blank">Shelter prices</a> rose 0.6% in May, up from 0.4% in April. They're up 8% in the past year.
  Inflation is still high enough to concern the <a href="https://www.politico.com/news/2023/06/14/the-new-inflation-politics-00101900" target="_blank">Federal Reserve</a>
  <a href="https://www.politico.com/news/2023/06/14/the-new-inflation-politics-00101900" target="_blank">Energy prices</a> dropped a whopping 3.6 percent — with gasoline alone plunging 5.6 percent
  Food prices ticked up only 0.2 percent in May compared to April, with <a href="https://www.politico.com/news/2023/06/14/the-new-inflation-politics-00101900" target="_blank">grocery costs</a> essentially flat after falling in the previous two months
  US inflation at the wholesale level has cooled once again, this time landing well below its pre-pandemic average. The Producer Price Index showed that annual price increases seen by producers measured 1.1% for the 12 months ended in May, easing sharply from the 2.3% bump recorded in April, according to data released Wednesday by the <a href="https://www.cnn.com/2023/06/14/economy/ppi-inflation-may/index.html" target="_blank">Bureau of Labor Statistics</a>.
  The PPI is a closely watched inflation gauge, since it captures <a href="https://www.cnn.com/2023/06/14/economy/ppi-inflation-may/index.html" target="_blank">average price shifts</a> upstream of the consumer. It’s viewed as a potential leading indicator of how prices could eventually behave at the store level.
  Stripping out the more volatile categories of energy and food, the core PPI index showed that prices increased 0.2% from April and moderated to 2.8% on an annual basis. The May PPI report is the second piece of good inflation news in a two-day span: On Tuesday, the <a href="https://www.cnn.com/2023/06/14/economy/ppi-inflation-may/index.html" target="_blank">Consumer Price Index</a> showed that inflation eased to 4% on an annual basis in May."""
  
  `;

  let response = await exports.getDivinciResponse(prompt);

  console.log("RESPONSE", response);
}

//dTest();

const getTurboJSON = async (prompt, temperature = .4) => {
    let response = await this.getTurboResponse(prompt, temperature);

    console.log('PROMPT', prompt);
    console.log('RESPONSE', response);

    if (response.status === 'error') return false;

    try {
        //console.log('getting JSON');
        const json = JSON.parse(response.content.replaceAll("\n", ""));
        //console.log('JSON', json);
        return json;
    } catch (err) {
        //console.log('JSON ERROR');
        //console.error(err);
        return false;
    }
}

const getTurboText = async (prompt, temperature = .4) => {
    //console.log('getTurboText');
    let response = await this.getTurboResponse(prompt, temperature);

    if (response.status === 'error') return false;

    return response.content;
}

exports.getChatJSON = async (prompt, temperature = .4) => getTurboJSON(prompt, temperature);
exports.getChatText = async (prompt, temperature = .4) => getTurboText(prompt, temperature);

exports.getGist = async (text, numSentences = 3) => {
    const prompt = `"""Give the overall gist of the Text below in ${numSentences > 1 ? `${numSentences} sentences` : `1 sentence`}.
    
    Text:
    ${text}\n"""\n`;

    let response = await this.getTurboResponse(prompt, .4);

    if (response.status === 'error') return false;

    return response.content;
}

exports.getKeywordsAndAffiliations = async (text) => {
    const prompt = `"""Provide a list of keywords and a list of affiliations contained in the following text. The keyword list must include all names of people, organizations, events, products, and services as well as all significant topics, concepts, and ideas. The affiliation list must include the individual's name as well as all titles, roles, and organizations that the individual is affiliated with. The returned format must be stringified JSON in the following format: {
        "keywords": array of keywords goes here,
        "affiliations": array of affiliations goes here
        }
        
        Text:
        ${text}
        """
        `
    let response = await this.getTurboResponse(prompt, .4);

    if (response.status === 'error') return false;

    try {
        const json = JSON.parse(response.content.replaceAll("\n", ""));
        return json;
    } catch (err) {
        return false;
    }


    return response.content;
}

exports.getConceptsNamesAndAffiliations = async (text) => {
    const prompt = `"""Provide a list of concepts, names, and affiliations contained in the following text. The concept list must include all significant topics, concepts, and ideas. The names list must include all names of all people, organizations, events, products, and services. The affiliation list must include each individual's name as well as all titles, roles, and organizations that the individual is affiliated with. The returned format must be stringified JSON in the following format: {
        "concepts": array of concepts goes here,
        "names": array of names goes here,
        "affiliations": array of affiliations goes here
        }
        
        Text:
        ${text}
        """
        `
    let response = await this.getTurboResponse(prompt, .4);

    if (response.status === 'error') return false;

    try {
        const json = JSON.parse(response.content.replaceAll("\n", ""));
        return json;
    } catch (err) {
        return false;
    }


    return response.content;
}

exports.getFactsRelatedToTopic = async (topic, text) => {
    const prompt = `"""I want to find all facts, ideas, and concepts in the provided Text that are related to the Topic provided below. Be sure to include all relevant facts, ideas, and concepts. If there are no facts, ideas, or concepts related to the topic then return an empty list. 

    The return format must solely be stringified JSON in the following format: {
    "facts": array of relevant facts, ideas, and concepts goes here
    }
    
    Topic:
    ${topic}

    Text:
    ${text}
    """
    `

    let response = await this.getTurboResponse(prompt, .4);

    console.log("RESPONSE", response);

    if (response.status === 'error') return false;

    let json;
    try {
        json = JSON.parse(response.content.replaceAll("\n", ""));
        
    } catch (err) {
        json = false;
    }
    
    console.log('json', json);

    return json;
}

exports.getOverallTopic = async (text, numWords = 32) => {
    const prompt = `"""In ${numWords} words, tell me the overall gist of the following text.

    Text:
    ${text}
    """`;

    let response = await this.getTurboResponse(prompt, .4);

    if (response.status === 'error') return false;

    return response.content;
}

exports.getTopicAndGist = async (text, numGistSentences = 3, numTopicWords = 32) => {
    const prompt = `"""In ${numGistSentences > 1 ? `${numGistSentences} sentences` : `1 sentence`} tell me the gist of the following text. Also, in ${numTopicWords} words or less, tell me the overall topic of the following text. The return format must be in stringified JSON in the following format: {
        "gist": gist goes here,
        "topic": topic goes here
    }

    Text:
    ${text}
    """`;

    let response = await this.getTurboResponse(prompt, .4);

    if (response.status === 'error') return false;

    try {
        const json = JSON.parse(response.content.replaceAll("\n", ""));
        return json;
    } catch (err) {
        return false;
    }
}

exports.getRelevantFacts = async (text, numFacts = 3) => {
    const prompt = `"""Find the ${numFacts} most relevant facts in regards to the Text below. The The return format must be in stringified JSON in the following format: {
        "facts": array of facts goes here
    }

    Text:
    ${text}
    """`;

    let response = await this.getTurboResponse(prompt, .4);

    if (response.status === 'error') return false;

    try {
        const json = JSON.parse(response.content.replaceAll("\n", ""));
        return json;
    } catch (err) {
        return false;
    }
}

exports.getArticleFromSourceList = async (topic, sourceList) => {
    const prompt = `"""Acting as a witty professor, write a warm and conversational news article on the Topic below using the facts from the various Sources below. Create the article using as many facts as possible without repeating any information.
    
    Topic:
    ${topic}\n
    ${sourceList}"""\n`;

    let response = await this.getTurboResponse(prompt, .4);

    if (response.status === 'error') return false;

    return response.content;
}

exports.rewriteArticleInEngagingManner = async (article) => {
    const prompt = `"""As a professional journalist, rewrite the following News Article in a dynamic and engaging style. Ensure your response preserves all the quotes in the news article.
    News Article:
    ${article}\n"""\n`;
    
    let response = await this.getTurboResponse(prompt, .4);

    if (response.status === 'error') return false;

    return response.content;
}


exports.extractReleventQuotes = async (topic, text) => {
    const prompt = `"""Below is a Topic and Text. I want to find all the speaker quotes cited in the Text that are relevant to the Topic. I solely want quote citations that are relevant to the topic.  The return format must solely be stringified JSON in the following format:
    {
        "quotes": array of relevant quotes along with the name of the speaker in the following format goes here {"quote": relevant quote, "speaker": speaker of relevant quote}
    }
        
    Topic:
    ${topic}

    Text:
    ${text.trim()}"""
    `;
 
    return await getTurboJSON(prompt, .4);
}

exports.insertQuotesFromQuoteList = async (initialArticle, quoteList) => {
    const prompt = `"""Below is a News Article and a list of Quotes. For each quote that is relevant to the news article, make the news article longer by incorporating every relevant quote. If none of the quotes are relevant to the news article then return the news article in its original form.
    
    News Article:
    ${initialArticle}
    
    ${quoteList}
    """
    `
   return await getTurboText(prompt, .4);
}

exports.getTagsAndTitles = async (article, numTitles = 10) => {
    const prompt = `"""Give ${numTitles} interesting, eye-catching titles for the provided News Article below.
    Also generate a list of tags that include the important words and phrases in the response. 
    The list of tags must also include the names of all people, products, services, places, companies, and organizations mentioned in the response.
    Also generate a conclusion for the news article.
    The return format must be stringified JSON in the following format: {
        "titles": array of titles goes here
        "tags": array of tags go here
        "conclusion": conclusion goes here
    }
    News Article:
    ${article}\n"""\n`;

    return await getTurboJSON(prompt, .7);
}
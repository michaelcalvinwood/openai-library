// https://beta.openai.com/docs/introduction/key-concepts

require('dotenv').config();
const axios = require('axios');



// completions API: https://beta.openai.com/docs/api-reference/completions
async function openAICompletionTest () {
    const request = {
        url: 'https://api.openai.com/v1/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
            'OpenAI-Organization': process.env.OPENAI_ORG_ID
        },
        data: {
            model: "text-davinci-003",
            prompt: "Explain who Karen Webster of Pymnts is.",
            max_tokens: 200,
            temperature: 0
        }
    }

    let response;

    try {
        response = await axios(request);
        console.log(response.data);
    } catch (e) {
        console.error(e);
    }
}

async function summarizeText (text) {
    const request = {
        url: 'https://api.openai.com/v1/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
            'OpenAI-Organization': process.env.OPENAI_ORG_ID
        },
        data: {
            model: "text-davinci-003",
            prompt: text + "\n\nTl;dr",
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 1.0
        }
    }

    let response;

    try {
        response = await axios(request);
        console.log(response.data);
    } catch (e) {
        console.error(e);
    }
}

summarizeText(`This year, Ahold Delhaize is seeing holiday shoppers flock to online grocery like never before.

The U.S. arm of the grocer, which encompasses thousands of stores across brands such as Giant, Food Lion and Stop & Shop as well as digital brands Peapod and FreshDirect, is seeing an increase in consumers’ expectations of digital convenience when it comes to holiday season purchasing. 

“We’re also a strong engagement on ecommerce,” Rom Kosla, executive vice president, information technology and chief information officer for Ahold Delhaize USA’s services company, Retail Business Services, said in an interview with PYMNTS. “From a technology standpoint, we have a fairly robust trend tracker of all transactions are coming through, and it’s highest we’ve seen — at least, during Thanksgiving it was the highest number of transactions — since all the previous holidays.”

He added that the company expects these trends to be the same for the December holidays.

This spike in digital engagement can be key for the grocer, boosting the adoption of eCommerce channels and, in turn, ushering consumers into the company’s connected ecosystem. Through these platforms, the grocer can gather customers’ data and consequently market to those shoppers more effectively in the future.

Kosla noted that in-store sales have also been strong during the season in addition to this digital growth.  

Indeed, PYMNTS research reflects that consumers are shifting their spending toward groceries and away from discretionary items over the holidays, as revealed in the study “New Reality Check: The Paycheck-to-Paycheck Report: Holiday Shopping Edition,” created in collaboration with LendingClub. The report, which draws from a survey of more than 3,400 U.S. consumers, found that, while many shoppers are cutting back on gift purchasing, few said the same of grocery spending.

Specifically, while 26% of consumers are reining in their retail purchasing and 29% their restaurant spending, only 17% said the same about grocery shopping. Conversely, more than twice that share — 38%— reported that they would be spending more on groceries this holiday season.`);
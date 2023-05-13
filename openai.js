// https://beta.openai.com/docs/introduction/key-concepts

require('dotenv').config();
const axios = require('axios');

/*
    Create an FAQ for the following text: <text>
*/


async function chatCompletion (prompt) {
    /* 
     * NO NEED TO SPECIFY MAX TOKENS
     * role: assistant, system, user
     */



    const request = {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.MCW_OPENAI_KEY}`,
            'OpenAI-Organization': process.env.MCW_OPENAI_ORG_ID
        },
        data: {
            model: "gpt-3.5-turbo",
            temperature: 0,
            messages:[
                {
                    role: 'system',
                    content: 'You are a blog post generator',

                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        }
    }

    let response;

    try {
        response = await axios(request);
        console.log(response.data.choices[0].message);
    } catch (e) {
        console.error(e.response.data);
    }
}

let prompt = `Give three interesting titles for an article about the joys of raising pitbulls and also give five topic headings for the article. The return format must be stringified JSON in the following format: {
    "titles": array of interesting titles here
    "headings": array of topic headings here
}`

chatCompletion(prompt);


// completions API: https://beta.openai.com/docs/api-reference/completions
async function openAICompletionTest (prompt, keyword = false) {
    if (keyword) prompt += ` Optimize the SEO value of your response for the keyword '${keyword}'.`;
    const request = {
        url: 'https://api.openai.com/v1/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
            'OpenAI-Organization': process.env.OPENAI_ORG_ID
        },
        data: {
            model: "text-davinci-003",
            prompt,
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

async function summarizeText2 (text, keyword = false) {
    let prompt = "Summarize this using five sentences in a professional tone.";
    if (keyword) prompt += ` Optimize the SEO value of the summary for the keyword '${keyword}'.`;
    prompt += ":\n\n" + text;

    const request = {
        url: 'https://api.openai.com/v1/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
            'OpenAI-Organization': process.env.OPENAI_ORG_ID
        },
        data: {
            model: "text-davinci-003",
            prompt,
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
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

async function generateBlogPost (topic, keywords, specialInstructions) {
    const prompt = specialInstructions ? 
    `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}.
    The content should be formatted in SEO-friendly HTML.
    The response should include an HTML title and meta description that both include the keywords.
    The response should include the keywords as many times as possible.
    ${specialInstructions}
    Also generate a list of tags that include the important words and phrases in the response. 
    The list of tags must also include the names of all people, products, services, places, companies, and organizations mentioned in the response.
    The return format must be stringified JSON in the following format: {
        "postContent": post content here
        "title": title goes here
        "metaDescription" : meta description goes here,
        "tags": array of tags go here
    }` :
    `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}.
    The content should be formatted in SEO-friendly HTML.
    The response should include an HTML title and meta description that both include the keywords.
    The response should include the keywords as many times as possible.
    Also generate a list of tags that include the important words and phrases in the response. 
    The list of tags must also include the names of all people, places, products, services, companies, and organizations mentioned in the response.
    The return format must be stringified JSON in the following format: {
        "postContent": post content here
        "title": title goes here
        "metaDescription" : meta description goes here,
        "tags": array of tags go here
    }`

    const request = {
        url: 'https://api.openai.com/v1/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.MCW_OPENAI_KEY}`,
            'OpenAI-Organization': process.env.MCW_OPENAI_ORG_ID
        },
        data: {
            model: "text-davinci-003",
            prompt,
            max_tokens: 3600,
            temperature: 0.25,
        }

    }

    let response;

    try {
        response = await axios(request);
        console.log(response.data);
    } catch (e) {
        console.error(e);
        return false;
    }

    return response.data;
}

// summarizeText2(`Italian and Albanian authorities have broken up an organized crime group’s crypto scam. 

// The group had stolen an estimated 15 million euros (about $16 million), the European Union Agency for Criminal Justice Cooperation (Eurojust) said in a Monday (Dec. 19) press release. 

// The group operated from a call center in Albania, contacting victims via unidentifiable phone numbers and offering “zero risk” investments in cryptocurrencies, according to the press release. 

// They delivered to the victims an immediate financial gain on a small investment and then, having gained the victims’ trust, convinced them to invest all their capital, the release said. 

// Once the victims had transferred those funds, the criminals embezzled the money and made themselves untraceable, per the release. 

// In a third part of the fraud, other members of the organized crime group contacted the victims and convinced them to make additional payments that they said would enable them to recover the lost funds, according to the press release. 

// The investigation led by Italian and Albanian authorities, with Eurojust facilitating cross-border cooperation, seized 160 electronic devices, a mobile phone and assets worth 3 million euros (about $3.2 million), the release said. 

// This announcement comes two weeks after French authorities charged two people with fraud and money laundering after they allegedly promised counterfeit cash or digital wallets for cryptocurrency and then stole the funds. 

// Bloomberg reported on Dec. 9 that the scammers set up fake identities, arranged meetings with victims, received crypto assets from the victims and then got access to the funds through the victims’ phones. 

// The fraudsters stole at least 2 million euros (about $2.1 million), according to the report. 

// In the United States, the Consumer Finance Protection Bureau (CFPB) said on Nov. 10 that it received more than 8,300 complaints related to crypto-assets between October 2018 and September 2022 and that 40% of these complaints involved frauds and scams. 

// “Our analysis of consumer complaints suggests that bad actors are leveraging crypto-assets to perpetrate fraud on the public,” CFPB Director Rohit Chopra said at the time. “Americans are also reporting transaction problems, frozen accounts and lost savings when it comes to crypto-assets.”`, 'crypto ring');


//openAICompletionTest('Explain why dogs make great pets.', 'Twitter');

// generateBlogPost(
//     '5 Best Places to Visit in Europe',
//     'European Vacation, European Tourism',
//     'The response must include the name of at least one restaurant, one hotel, and one tourist attraction for each place.'
// )

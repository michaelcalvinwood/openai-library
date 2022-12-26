require('dotenv').config();
const axios = require('axios');

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
            prompt: "Say this is a test",
            max_tokens: 7,
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

openAICompletionTest();
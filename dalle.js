require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

async function generateImage () {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createImage({
      prompt: "Amazon destroying Walmart",
      n: 1,
      size: "1024x1024",
    });

    console.log(response.data);
}

generateImage();



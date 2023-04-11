const { OpenAI} = require ("langchain/llms/openai");
const { Configuration, OpenAIApi } = require("openai");
const p = require ("promptable");

require("dotenv").config;


const embedding = async (input) => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);
      const embeddingResponse = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input,
      })
  
      const [{ embedding }] = embeddingResponse.data.data
      return embedding;
}

const run = async () => {

    //Instantiante the OpenAI model 
    //Pass the "temperature" parameter which controls the RANDOMNESS of the model's output. A lower temperature will result in more predictable output, while a higher temperature will result in more random output. The temperature parameter is set between 0 and 1, with 0 being the most predictable and 1 being the most random
    const model = new OpenAI({ temperature: 0.9 });

    //Calls out to the model's (OpenAI's) endpoint passing the prompt. This call returns a string
    const res = await model.call(
        "What would be a good company name a company that makes colorful socks?"
    );
    console.log({ res });
};

function splitWords(string, chunk = 400, overlap = 200) { 
    const newArray = string.split(" "); 
    let count = 0;
    const text = [];
    while (count < newArray.length) {
        let temp = [];
        for (let i = count; i < count + chunk && i < newArray.length; ++i) temp.push(newArray[i]);
        text.push(temp.join(" "));
        count += chunk - overlap;
    }
    console.log('text', text);
 }; 

//embedding ('hello')

splitWords('Hello, how are you doing my friend? We have so many things to talk about!');
/*
 * See Linux Utilities repo for auto installing and auto configuring postgres database on Ubuntu 22.04
 * For additional pgvector query options and optimizations see: https://pgxn.org/dist/vector/
 */

require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const { Client } = require('pg');
const pgvector = require('pgvector/pg');

const config = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432
};
const pgClient = new Client(config);

let connectedFlag = false;

function splitWords(string, chunk = 400, overlap = 200) { 
  const newArray = string.split(" "); 
  let count = 0;
  const text = [];
  while (count < newArray.length) {
      let temp = [];
      for (let i = count; i < count + chunk && i < newArray.length; ++i) temp.push(newArray[i]);
      text.push(temp.join(" ").replaceAll("\n", '').replaceAll("\r", ''));
      count += chunk - overlap;
  }
  return text;
}; 

const createPgvectorTable = async table => {
    let q = `CREATE TABLE ${table} (id serial primary key, body text not null, embedding vector(1536));`;
    await pgClient.query(q);   
    q = `CREATE INDEX ON ${table} USING ivfflat (embedding vector_l2_ops)`;
    await pgClient.query(q);   
}

const getEmbedding = async (input) => {
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

const insertEmbedding = async (string, table = 'posts') => {
  try {
    const embedding = await getEmbedding (string);
    const q = `INSERT INTO ${table} (body, embedding) VALUES ('${string}', '${[pgvector.toSql(embedding)]}')`;
    await pgClient.query(q);   
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
}

const getNearestNeighbors = async (string, table = 'posts') => {
  const embedding = await getEmbedding (string);
  const q = `SELECT body FROM ${table} ORDER BY embedding <-> '${[pgvector.toSql(embedding)]}' LIMIT 5`;
  const result = await pgClient.query(q);
  return result.rows;
}

// Program code goes here
const run = async () => {
    const result = await getNearestNeighbors('hello earth');
    console.log('hello earth result', result);
}

// connect to postgres database and then launch program
const connectToPostgres = async () => {
  await pgClient.connect();
  try {
    await pgvector.registerType(pgClient);
    run();
  } catch (error) {
    console.log(error);
  } 
}
connectToPostgres();

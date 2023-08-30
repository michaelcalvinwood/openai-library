require('dotenv').config();

const jwt = require('jsonwebtoken');
const { JWT_PASSWORD } = process.env;

exports.validateToken = token => {
  
    let test;
  
    try {
       test = jwt.verify(token, JWT_PASSWORD)
      // TODO: check expiration
    } catch(err) {
      return false;
    }
    return test;
  }
  
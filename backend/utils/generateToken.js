const jwt = require('jsonwebtoken');
const fs = require('fs')
const path = require('path');


const generateToken = (id, time = '90d') => {

  //var cert = fs.readFileSync('jwtRS256.pem');  // get private key

  const filePath = path.resolve(__dirname, '../jwtRS256.pem');
  // Read the file
  const cert = fs.readFileSync(filePath);

  return jwt.sign({ id }, cert, {
    expiresIn: time,
    algorithm:'RS256'
  });
};

module.exports = { generateToken };

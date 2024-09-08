const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models/user.model');
const fs = require('fs')
const path = require('path');

module.exports.protectUser = asyncHandler(async (req, res, next) => {

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

    try {

      token = req.headers.authorization.split(' ')[1];

      //var cert = fs.readFileSync('jwtRS256.pem');  // get private key
      const filePath = path.resolve(__dirname, '../jwtRS256.pem');
      // Read the file
      const cert = fs.readFileSync(filePath);
  
      const decoded = jwt.verify(token, cert, { algorithms: ['RS256']});
      req.user = await User.findById(decoded.id);
     
      if (req.user === null) {
        res.status(401);
        throw new Error('Not authorized1');
      }

      next();
    } catch (error) {
      res.status(401);
      console.log('error',error)
      throw new Error('Not authorized2:');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized3');
  }
});


module.exports.protectAdmin = asyncHandler(async (req, res, next) => {

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

    try {
      token = req.headers.authorization.split(' ')[1];

      //var cert = fs.readFileSync('jwtRS256.pem');  // get private key
      const filePath = path.resolve(__dirname, '../jwtRS256.pem');
      // Read the file
      const cert = fs.readFileSync(filePath);

      const decoded = jwt.verify(token, cert, { algorithms: ['RS256']});

      req.user = await User.findOne({_id:decoded.id, userType:'admin'});

      if (req.user === null) {
        res.status(401);
        throw new Error('Not authorized');
      }
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized');
  }
});
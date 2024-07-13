const express = require('express');
const {jsonupload}=require("../../config/multerUpload")

const { 
      sendRequestInfo, 
      sendResponseInfo,   
      getProjectVulnerabilities     
    } = require('../../controllers/mirroredScans.controller');

const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/mirroredScans/
router.post('/sendRequestInfo', sendRequestInfo);
router.post('/sendResponseInfo', sendResponseInfo);
router.get('/getProjectVulnerabilities', protectUser, getProjectVulnerabilities);

module.exports = router;
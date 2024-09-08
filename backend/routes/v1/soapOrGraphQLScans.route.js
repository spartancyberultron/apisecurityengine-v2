const express = require('express');
const { soapGraphQLUpload } = require("../../config/multerUpload")

const { 
      getAllSOAPOrGraphQLScans, 
      startSOAPOrGraphQLScan,   
      getSOAPOrGraphQLScanDetails,          
      deleteSOAPOrGraphQLScan
    } = require('../../controllers/soapOrGraphQLScans.controller');

const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/SOAPOrGraphQLScans/

router.get('/getAllSOAPOrGraphQLScans/:page/:rowsPerPage', protectUser, getAllSOAPOrGraphQLScans);
router.post('/getSOAPOrGraphQLScanDetails', protectUser, getSOAPOrGraphQLScanDetails);
router.post('/startSOAPOrGraphQLScan', protectUser, soapGraphQLUpload.single("file"), startSOAPOrGraphQLScan);
router.post('/deleteSOAPOrGraphQLScan', protectUser, deleteSOAPOrGraphQLScan);

module.exports = router;
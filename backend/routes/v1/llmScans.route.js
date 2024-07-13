const express = require('express');

const { 
      getAllLLMScans, 
      startLLMScan,   
      getLLMScanDetails,          
      deleteLLMScan
    } = require('../../controllers/llmScans.controller');

const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/llmScans/

router.get('/getAllLLMScans', protectUser, getAllLLMScans);
router.post('/getLLMScanDetails', protectUser, getLLMScanDetails);
router.post('/startLLMScan', protectUser, startLLMScan);
router.post('/deleteLLMScan', protectUser, deleteLLMScan);


module.exports = router;
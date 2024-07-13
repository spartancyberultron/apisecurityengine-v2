const express = require('express');

const { 
      getLLMCompliances, 
      getAPICompliances        
    } = require('../../controllers/complianceMonitoring.controller');

const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/complianceMonitoring/

router.get('/getLLMCompliances', protectUser, getLLMCompliances);
router.get('/getAPICompliances', protectUser, getAPICompliances);


module.exports = router;
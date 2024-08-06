const express = require('express');
const {jsonupload}=require("../../config/multerUpload")

const { 
      getAllActiveScans, 
      startActiveScan,   
      getActiveScanDetails,      
      runTestForSensitiveDataInPathParams,
      runTestForBasicAuthenticationDetected,
      runTestForEndpointNotSecuredBySSL,
      runTestForUnauthenticatedEndpointReturningSensitiveData,
      runTestForSensitiveDataInQueryParams,
      runTestForPIIDataDetectedInResponse,
      runTestForHTTPVerbTamperingPossible,
      runTestForContentTypeInjectionPossible,
      runTestForSecurityHeadersNotEnabledOnHost,
      runTestForResourceDeletionPossible,
      runTestForBrokenObjectLevelAuthorization,
      runTestForBrokenAuthentication,
      runTestForExcessiveDataExposure,
      runTestForInjectionPossible,
      runTestForXSSVulnerabilityFound,
      runTestForWalletHijackingPossible,
      runTestForPreImageAttackPossible,
      generatePDFForAScan,
      deleteActiveScan,
      runScanFromPostman
    } = require('../../controllers/activeScans.controller');

const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/activeScans/

router.get('/getAllActiveScans', protectUser, getAllActiveScans);
router.post('/getActiveScanDetails', protectUser, getActiveScanDetails);

router.post('/startActiveScan', protectUser, jsonupload.single("file"), startActiveScan);
router.post('/runScanFromPostman', protectUser, runScanFromPostman);

router.post('/generatePDFForAScan', protectUser, generatePDFForAScan);


router.post('/deleteActiveScan', protectUser, deleteActiveScan);


module.exports = router;
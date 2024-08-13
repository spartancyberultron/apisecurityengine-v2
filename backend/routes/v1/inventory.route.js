const express = require('express');
const {jsonupload}=require("../../config/multerUpload")

const { 
      fetchAPICollections, 
      addAPICollectionVersion,   
      fetchAPICollectionVersions,      
      deleteAPICollection,
      deleteAPICollectionVersion,
      //editAPICollection,
      startActiveScanOfACollectionVersion,
      fetchActiveScansOfACollectionVersion,    
      fetchEndpointsofAVersion  
    } = require('../../controllers/inventory.controller');

const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/activeScans/

router.post('/addAPICollectionVersion', protectUser, jsonupload.single("file"), addAPICollectionVersion);
router.get('/fetchAPICollections/:page/:rowsPerPage', protectUser, fetchAPICollections);
router.get('/fetchAPICollectionVersions', protectUser, fetchAPICollectionVersions);
router.get('/fetchEndpointsofAVersion', protectUser, fetchEndpointsofAVersion);
router.post('/deleteAPICollection', protectUser, deleteAPICollection);
router.post('/deleteAPICollectionVersion', protectUser, deleteAPICollectionVersion);
//router.get('/editAPICollection', protectUser, editAPICollection);
router.get('/startActiveScanOfACollectionVersion', protectUser, startActiveScanOfACollectionVersion);
router.get('/fetchActiveScansOfACollectionVersion', protectUser, fetchActiveScansOfACollectionVersion);


module.exports = router;
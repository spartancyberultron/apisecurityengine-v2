const express = require('express');
const { sbomUpload } = require("../../config/multerUpload")

const { 
      getAllSBOMScans, 
      startSBOMScan,   
      getSBOMScanDetails,          
      deleteSBOMScan
    } = require('../../controllers/sbomScans.controller');

const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/sbomScans/

router.get('/getAllSBOMScans', protectUser, getAllSBOMScans);
router.post('/getSBOMScanDetails', protectUser, getSBOMScanDetails);
router.post('/startSBOMScan', protectUser, sbomUpload.single("file"), startSBOMScan);

router.post('/deleteSBOMScan', protectUser, deleteSBOMScan);

module.exports = router;
const mongoose = require('mongoose');

const sbomScanSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  orgProject: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrgProject',
  },
  scanName: {
    type: String,
  },
  sbomFilePath: {
    type: String,
  },    
  scanCompletedAt: {
    type: Date,
  },
  licenses: {
    type: [String]
  },
  status:{
    type: String,
  },
  unspecifiedCount:{
    type: Number,
  },
  lowCount:{
    type: Number,
  },
  moderateCount:{
    type: Number,
  },
  highCount:{
    type: Number,
  },
  criticalCount:{
    type: Number,
  }
}, {
  timestamps: true,
});

const SBOMScan = mongoose.model('SBOMScan', sbomScanSchema);

module.exports = SBOMScan;
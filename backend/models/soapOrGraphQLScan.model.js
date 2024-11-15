const mongoose = require('mongoose');

const soapOrGraphQLScanSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }, 
  orgProject: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrgProject',
  },
  collectionFilePath: {
    type: String,
  },  
  scanCompletedAt: {
    type: Date,
  },
  collectionUrl: {
    type: String,
  },
  scanName: {
    type: String,
  },
  type:{
    type: String,  // SOAP or GraphQL
  },
  status:{
    type: String,
  },
  projectPhase: {
    type: String,
    enum: ['Design', 'Development', 'Testing', 'Maintenance']
  }
}, {
  timestamps: true,
});

const SOAPOrGraphQLScan = mongoose.model('SOAPOrGraphQLScan', soapOrGraphQLScanSchema);

module.exports = SOAPOrGraphQLScan;
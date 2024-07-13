const mongoose = require('mongoose');

const soapOrGraphQLScanSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
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
  }
}, {
  timestamps: true,
});

const SOAPOrGraphQLScan = mongoose.model('SOAPOrGraphQLScan', soapOrGraphQLScanSchema);

module.exports = SOAPOrGraphQLScan;
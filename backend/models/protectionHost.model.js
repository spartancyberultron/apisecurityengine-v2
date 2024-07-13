const mongoose = require('mongoose');

const protectionHostSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },  
  hostName: {
    type: String,
  },
  hostIP: {
    type: String,
  },
  hostPort:{
    type: String,
  }, 
  hostDomain:{
    type: String,
  }, 
  proxyDomain:{
    type: String,
  },
  sourcesBlocked:{
    type: String,
  }, 
  

}, {
  timestamps: true,
});

const ProtectionHost = mongoose.model('ProtectionHost', protectionHostSchema);

module.exports = ProtectionHost;
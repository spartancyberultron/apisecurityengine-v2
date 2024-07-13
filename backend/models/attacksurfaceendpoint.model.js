const mongoose = require('mongoose');

const atackSurfaceEndpointSchema = mongoose.Schema({  
  
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true 
  },
  attackSurfaceScan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AttackSurfaceScan',
    index: true 
  }, 
  url: { // If the url is present in the collection as a full url string, instead of an object
    type: String, 
  },   
  riskScore: { 
    type: String 
  },
  piiFields: [{ 
    type: String 
  }],
  alerts: [{ 
    type: String 
  }],
  firstDetected: { 
    type: String 
  },
  lastActive: { 
    type: String 
  },
  isAuthenticated: { 
    type: String 
  },
  vulnCount: { 
    type: Number ,
    default: 0, 
  }
},{
  timestamps: true,
});

const AttackSurfaceEndpoint = mongoose.model('AttackSurfaceEndpoint', atackSurfaceEndpointSchema);

module.exports = AttackSurfaceEndpoint;
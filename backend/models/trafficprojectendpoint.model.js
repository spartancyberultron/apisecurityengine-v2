const mongoose = require('mongoose');

const trafficProjectEndpointSchema = mongoose.Schema({
  
  project: { 
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Project',
     index: true,
  },  
  url: { // If the url is present in the collection as a full url string, instead of an object
    type: String, 
  },
  method: { 
    type: String, 
  },
  headers: [
    {
      key:{
        type:String
      },
      value:{
        type:String
      },
      type:{
        type:String
      }
    },
  ],
  queryParams: [
    {
      key:{
        type:String
      },
      value:{
        type:String
      },      
    },
  ],  
  requestBody: { 
    type: mongoose.Schema.Types.Mixed 
  },
  responseBody: { 
    type: mongoose.Schema.Types.Mixed 
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
  },
  endpointStatus: { 
    type: String ,
    default: '---', 
  }
},{
  timestamps: true,
});

const TrafficProjectEndpoint = mongoose.model('TrafficProjectEndpoint', trafficProjectEndpointSchema);

module.exports = TrafficProjectEndpoint;
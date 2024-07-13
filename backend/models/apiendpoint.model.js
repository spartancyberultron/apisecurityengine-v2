const mongoose = require('mongoose');

const apiEndpointSchema = mongoose.Schema({
  
  theCollectionVersion: { 
     type: mongoose.Schema.Types.ObjectId,
     ref: 'APICollectionVersion',
     index: true,
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true 
  },
  name: { 
    type: String, 
  },
  protocol:{
    type: String, 
  },
  host:{
    type: String, 
  },
  port:{
    type: String, 
  },  
  endpoint: { 
    type: String, 
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
  authorization: {
    type: {
      type: String,
      enum: ['None', 
             'bearer', 
             'apikey',
             'digest',
             'jwt', 
             'oauth1',
             'oauth2',
             'basic'],
      required: true,
      default: 'None'
    },
    apikey:  [
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
    bearer:  [
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
    basic: [
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
    digest: [
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
    oauth1: [
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
    oauth2: [
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
  },
  requestBody: { 
    type: mongoose.Schema.Types.Mixed 
  },
  responseBody: { 
    type: mongoose.Schema.Types.Mixed 
  },
  description: { 
    type: String 
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

const ApiEndpoint = mongoose.model('ApiEndpoint', apiEndpointSchema);

module.exports = ApiEndpoint;
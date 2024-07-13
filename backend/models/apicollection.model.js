const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({

  user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
  },
  collectionType: { // OpenAPI, PostMan, Swagger
    type: String,
  },
  collectionName:{
    type: String,
  },
  collectionNativeId:{
    type: String,
  },  
  collectionSchemaURL: { 
    type: String,
  }, 
  collectionFilePath: { 
    type: String,
  },  
},{
  timestamps: true,
});

const APICollection = mongoose.model('APICollection', apiSchema);

module.exports = APICollection;
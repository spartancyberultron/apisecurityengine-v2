const mongoose = require('mongoose');

const apiCollectionVersionSchema = new mongoose.Schema({

  apiCollection: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'APICollection',
  },
  version: { 
    type: String,
  }  
},{
  timestamps: true,
});

const APICollectionVersion = mongoose.model('APICollectionVersion', apiCollectionVersionSchema);

module.exports = APICollectionVersion;
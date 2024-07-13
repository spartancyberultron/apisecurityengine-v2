const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({

  name: {
    type: String,
  },  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', 
  },  
}, {
  timestamps: true,
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;

const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
  name: {
    type: String,
    required: true, // Optional: Add any required fields or constraints here
  },  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', 
  }, 
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }],  
}, {
  timestamps: true,
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;

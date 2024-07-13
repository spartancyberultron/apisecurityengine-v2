const mongoose = require('mongoose');

const ticketUpdateSchema = mongoose.Schema({
  
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket', 
  },    
  updateText: {
    type: String,
  }, 
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  attachments: {
    type: [String],
  }, 
  status: {
    type: String,
  },
}, {
  timestamps: true,
});

const TicketUpdate = mongoose.model('TicketUpdate', ticketUpdateSchema);

module.exports = TicketUpdate;

const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({

  title: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  ticketId: {
    type: Number,
  },
  priority: {
    type: String,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', 
  },  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },  
  status: {
    type: String,
  }, 
  openedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  note: {
    type: String,
  },
  attachments: {
    type: [String],
  }, 
}, {
  timestamps: true,
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
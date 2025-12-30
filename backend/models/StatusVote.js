const mongoose = require('mongoose');

const statusVoteSchema = new mongoose.Schema({
  shopId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  isOpen: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

statusVoteSchema.index({ shopId: 1, timestamp: -1 });
statusVoteSchema.index({ shopId: 1, userId: 1, timestamp: -1 });

module.exports = mongoose.model('StatusVote', statusVoteSchema);



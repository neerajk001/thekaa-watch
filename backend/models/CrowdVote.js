const mongoose = require('mongoose');

const crowdVoteSchema = new mongoose.Schema({
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
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

crowdVoteSchema.index({ shopId: 1, timestamp: -1 });
crowdVoteSchema.index({ shopId: 1, userId: 1, timestamp: -1 });

module.exports = mongoose.model('CrowdVote', crowdVoteSchema);



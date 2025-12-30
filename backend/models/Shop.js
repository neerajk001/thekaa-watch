const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  osmId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lon: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['alcohol', 'beverages', 'bar'],
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

shopSchema.index({ lat: 1, lon: 1 });

module.exports = mongoose.model('Shop', shopSchema);



const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const merchandiseSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    default: 'General'
  },
  image_url: String,
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  },
  updated_at: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  collection: 'merchandise',
  versionKey: false
});

module.exports = mongoose.model('Merchandise', merchandiseSchema);


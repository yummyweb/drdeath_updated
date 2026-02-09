const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const contactSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true
  },
  phone: String,
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'new'
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  collection: 'contacts',
  versionKey: false
});

module.exports = mongoose.model('Contact', contactSchema);


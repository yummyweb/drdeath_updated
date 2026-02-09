const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const storySchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  user_name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  incident_date: {
    type: String,
    required: true
  },
  hospital_name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  outcome: String,
  images: {
    type: [String],
    default: []
  },
  documents: {
    type: [{
      filename: String,
      url: String,
      title: String,
      uploaded_at: String
    }],
    default: []
  },
  external_links: {
    type: [{
      title: String,
      url: String,
      type: String  // 'linkedin', 'petition', 'judgment', 'other'
    }],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_notes: String,
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  },
  updated_at: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  collection: 'stories',
  versionKey: false
});

module.exports = mongoose.model('Story', storySchema);


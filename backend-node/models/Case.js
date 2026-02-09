const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const caseSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    default: ''
  },
  youtube_url: {
    type: String,
    default: ''
  },
  youtube_thumbnail: {
    type: String,
    default: ''
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
  order: {
    type: Number,
    default: 0
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
  collection: 'cases',
  versionKey: false
});

module.exports = mongoose.model('Case', caseSchema);


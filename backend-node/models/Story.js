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
    required: true,
    index: true
  },
  user_name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  incident_date: {
    type: String,
    required: true
  },
  hospital_name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 50000
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
      type: String
    }],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  admin_notes: String
}, {
  collection: 'stories',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for admin list queries
storySchema.index({ status: 1, created_at: -1 });
storySchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('Story', storySchema);

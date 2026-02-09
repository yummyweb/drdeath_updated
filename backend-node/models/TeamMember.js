const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const teamMemberSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  image_url: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  linkedin_url: {
    type: String,
    default: ''
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
  collection: 'team_members',
  versionKey: false
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);


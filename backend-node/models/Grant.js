const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const grantSchema = new mongoose.Schema({
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
  user_email: {
    type: String,
    required: true
  },
  case_summary: {
    type: String,
    required: true
  },
  case_type: {
    type: String,
    required: true
  },
  opponent_details: {
    type: String,
    required: true
  },
  current_stage: {
    type: String,
    required: true
  },
  annual_income: {
    type: Number,
    required: true
  },
  family_members: {
    type: Number,
    required: true
  },
  other_income_sources: String,
  amount_required: {
    type: Number,
    required: true
  },
  purpose_of_funding: {
    type: String,
    required: true
  },
  breakdown_of_costs: {
    type: String,
    required: true
  },
  bank_account_name: {
    type: String,
    required: true
  },
  bank_account_number: {
    type: String,
    required: true
  },
  bank_ifsc: {
    type: String,
    required: true
  },
  supporting_documents: {
    type: [{
      filename: String,
      url: String,
      title: String,
      uploaded_at: String
    }],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  amount_approved: Number,
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
  collection: 'grants',
  versionKey: false
});

module.exports = mongoose.model('Grant', grantSchema);


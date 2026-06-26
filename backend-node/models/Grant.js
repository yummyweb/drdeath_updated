const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const grantSchema = new mongoose.Schema({
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
  user_email: {
    type: String,
    required: true
  },
  case_summary: {
    type: String,
    required: true,
    maxlength: 10000
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
    required: true,
    min: [0, 'Annual income cannot be negative']
  },
  family_members: {
    type: Number,
    required: true,
    min: [1, 'Family members must be at least 1'],
    max: [50, 'Family members value seems too high']
  },
  other_income_sources: String,
  amount_required: {
    type: Number,
    required: true,
    min: [1, 'Amount required must be positive']
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
    required: true,
    trim: true
  },
  // Stored as-is; encrypt at application layer before production
  bank_account_number: {
    type: String,
    required: true,
    trim: true,
    minlength: [9, 'Account number must be at least 9 digits'],
    maxlength: [18, 'Account number must be at most 18 digits']
  },
  bank_ifsc: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: (v) => IFSC_REGEX.test(v),
      message: 'Invalid IFSC code format (expected e.g. SBIN0001234)'
    }
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
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  amount_approved: Number,
  admin_notes: String,

  // Audit trail
  moderated_by:   { type: String, default: null },  // admin email
  moderated_at:   { type: Date,   default: null },
  moderation_history: {
    type: [{
      status:         String,
      admin_notes:    String,
      amount_approved:Number,
      by:             String,
      at:             Date,
    }],
    default: []
  }
}, {
  collection: 'grants',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

grantSchema.index({ status: 1, created_at: -1 });
grantSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('Grant', grantSchema);

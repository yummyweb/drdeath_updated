const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  phone: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Email verification
  email_verified:  { type: Boolean, default: false },
  otp:             { type: String,  default: null },
  otp_expires:     { type: Date,    default: null },
  // Password reset
  reset_token:         { type: String, default: null },
  reset_token_expires: { type: Date,   default: null },

  created_at: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  collection: 'users',
  versionKey: false
});

// Don't include password in JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otp_expires;
  delete obj.reset_token;
  delete obj.reset_token_expires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);


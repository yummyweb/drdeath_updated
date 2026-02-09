const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  user_id: String,
  items: [{
    merchandise_id: String,
    merchandise_name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  total_amount: {
    type: Number,
    required: true
  },
  shipping_name: {
    type: String,
    required: true
  },
  shipping_email: {
    type: String,
    required: true
  },
  shipping_phone: {
    type: String,
    required: true
  },
  shipping_address: {
    type: String,
    required: true
  },
  shipping_city: {
    type: String,
    required: true
  },
  shipping_state: {
    type: String,
    required: true
  },
  shipping_pincode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
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
  collection: 'orders',
  versionKey: false
});

module.exports = mongoose.model('Order', orderSchema);


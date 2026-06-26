const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Merchandise = require('../models/Merchandise');
const { getCurrentUser, getOptionalUser, requireAdmin } = require('../middleware/auth');

// Create order (user or guest)
router.post('/orders', getOptionalUser, async (req, res) => {
  try {
    const { items, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode } = req.body;

    // Validate merchandise and check stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const merch = await Merchandise.findOne({ id: item.merchandise_id, is_active: true });
      if (!merch) {
        return res.status(404).json({ detail: `Merchandise ${item.merchandise_id} not found` });
      }

      if (merch.stock < item.quantity) {
        return res.status(400).json({ detail: `Insufficient stock for ${merch.name}` });
      }

      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        merchandise_id: item.merchandise_id,
        merchandise_name: merch.name,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal
      });
    }

    const order = await Order.create({
      user_id: req.user ? req.user.id : null,
      items: orderItems,
      total_amount: totalAmount,
      shipping_name,
      shipping_email,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      status: 'pending'
    });

    // Update stock
    for (const item of items) {
      await Merchandise.updateOne(
        { id: item.merchandise_id },
        { $inc: { stock: -item.quantity } }
      );
    }

    res.json(order);
  } catch (error) {
    logger.error({ err: error }, 'Create order error:');
    res.status(500).json({ detail: 'Failed to create order' });
  }
});

// Get my orders (authenticated users)
router.get('/orders/my', getCurrentUser, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id }).sort({ created_at: -1 }).limit(100);
    res.json(orders);
  } catch (error) {
    logger.error({ err: error }, 'Get my orders error:');
    res.status(500).json({ detail: 'Failed to fetch orders' });
  }
});

// Get all orders (admin only)
router.get('/admin/orders', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    const orders = await Order.find(query).sort({ created_at: -1 }).limit(500);
    res.json(orders);
  } catch (error) {
    logger.error({ err: error }, 'Admin get orders error:');
    res.status(500).json({ detail: 'Failed to fetch orders' });
  }
});

// Update order status (admin only)
router.put('/admin/orders/:orderId/status', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ detail: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findOne({ id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ detail: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = status;
    order.updated_at = new Date().toISOString();
    await order.save();

    // If cancelled, restore stock
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        await Merchandise.updateOne(
          { id: item.merchandise_id },
          { $inc: { stock: item.quantity } }
        );
      }
    }

    res.json(order);
  } catch (error) {
    logger.error({ err: error }, 'Update order status error:');
    res.status(500).json({ detail: 'Failed to update order status' });
  }
});

module.exports = router;


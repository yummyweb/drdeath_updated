const express = require('express');
const router  = express.Router();
const FAQ     = require('../models/FAQ');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const logger  = require('../utils/logger');

// ── Public ────────────────────────────────────────────────────────────────────

router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch FAQs');
    res.status(500).json({ detail: 'Failed to fetch FAQs' });
  }
});

// ── Admin ─────────────────────────────────────────────────────────────────────

// Get all (including inactive)
router.get('/admin/faqs', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) {
    logger.error({ err }, 'Admin fetch FAQs failed');
    res.status(500).json({ detail: 'Failed to fetch FAQs' });
  }
});

// Create
router.post('/admin/faqs', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { question, answer, order, active } = req.body;
    if (!question?.trim() || !answer?.trim())
      return res.status(400).json({ detail: 'Question and answer are required' });
    const faq = await FAQ.create({ question: question.trim(), answer: answer.trim(), order: order ?? 0, active: active ?? true });
    res.status(201).json(faq);
  } catch (err) {
    logger.error({ err }, 'Create FAQ failed');
    res.status(500).json({ detail: 'Failed to create FAQ' });
  }
});

// Update
router.put('/admin/faqs/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { question, answer, order, active } = req.body;
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question: question?.trim(), answer: answer?.trim(), order, active },
      { new: true, runValidators: true }
    );
    if (!faq) return res.status(404).json({ detail: 'FAQ not found' });
    res.json(faq);
  } catch (err) {
    logger.error({ err }, 'Update FAQ failed');
    res.status(500).json({ detail: 'Failed to update FAQ' });
  }
});

// Delete
router.delete('/admin/faqs/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ detail: 'FAQ not found' });
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    logger.error({ err }, 'Delete FAQ failed');
    res.status(500).json({ detail: 'Failed to delete FAQ' });
  }
});

// Reorder (bulk update orders)
router.patch('/admin/faqs/reorder', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body; // array of ids in desired order
    if (!Array.isArray(ids)) return res.status(400).json({ detail: 'ids must be an array' });
    await Promise.all(ids.map((id, idx) => FAQ.findByIdAndUpdate(id, { order: idx })));
    res.json({ message: 'Reordered' });
  } catch (err) {
    logger.error({ err }, 'Reorder FAQs failed');
    res.status(500).json({ detail: 'Failed to reorder FAQs' });
  }
});

module.exports = router;

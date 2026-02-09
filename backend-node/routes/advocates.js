const express = require('express');
const router = express.Router();
const multer = require('multer');
const Advocate = require('../models/Advocate');
const { hashPassword } = require('../utils/auth');

const upload = multer({ storage: multer.memoryStorage() });

// Register advocate
router.post('/advocates/register', async (req, res) => {
  try {
    const { full_name, email, phone, password, bar_council_number, specializations, experience_years, areas_of_operation, about, languages } = req.body;

    // Check if email exists
    const existing = await Advocate.findOne({ email });
    if (existing) {
      return res.status(400).json({ detail: 'Email already registered as advocate' });
    }

    // Check bar council number
    const existingBar = await Advocate.findOne({ bar_council_number });
    if (existingBar) {
      return res.status(400).json({ detail: 'Bar Council number already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const advocate = await Advocate.create({
      full_name,
      email,
      phone,
      password: hashedPassword,
      bar_council_number,
      specializations,
      experience_years,
      areas_of_operation,
      about,
      languages: languages || ['English', 'Hindi'],
      status: 'pending'
    });

    res.json(advocate.toJSON());
  } catch (error) {
    console.error('Register advocate error:', error);
    res.status(500).json({ detail: 'Failed to register advocate' });
  }
});

// Get approved advocates (public)
router.get('/advocates', async (req, res) => {
  try {
    const { location, specialization, search } = req.query;
    const query = { status: 'approved' };

    if (location) {
      query.areas_of_operation = { $regex: location, $options: 'i' };
    }

    if (specialization) {
      query.specializations = { $regex: specialization, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { about: { $regex: search, $options: 'i' } },
        { areas_of_operation: { $regex: search, $options: 'i' } }
      ];
    }

    const advocates = await Advocate.find(query).select('-password').sort({ created_at: -1 }).limit(100);
    res.json(advocates);
  } catch (error) {
    console.error('Get advocates error:', error);
    res.status(500).json({ detail: 'Failed to fetch advocates' });
  }
});

// Get advocate by ID (public)
router.get('/advocates/:advocateId', async (req, res) => {
  try {
    const advocate = await Advocate.findOne({ id: req.params.advocateId, status: 'approved' }).select('-password');
    if (!advocate) {
      return res.status(404).json({ detail: 'Advocate not found' });
    }
    res.json(advocate);
  } catch (error) {
    console.error('Get advocate error:', error);
    res.status(500).json({ detail: 'Failed to fetch advocate' });
  }
});

module.exports = router;


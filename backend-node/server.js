require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS === '*' ? '*' : process.env.CORS_ORIGINS.split(','),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory (images and documents)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// MongoDB connection
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'legal_guardian';

mongoose.connect(`${mongoUrl}/${dbName}`);

mongoose.connection.on('connected', async () => {
  console.log('✅ MongoDB connected');
  // Create default admin and settings
  await createDefaults();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Import routes
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const adminRoutes = require('./routes/admin');
const advocateRoutes = require('./routes/advocates');
const grantRoutes = require('./routes/grants');
const contactRoutes = require('./routes/contact');
const merchandiseRoutes = require('./routes/merchandise');
const orderRoutes = require('./routes/orders');
const settingsRoutes = require('./routes/settings');
const publicRoutes = require('./routes/public');
const casesRoutes = require('./routes/cases');
const teamMembersRoutes = require('./routes/teamMembers');

// API routes
app.use('/api', authRoutes);
app.use('/api', storyRoutes);
app.use('/api', adminRoutes);
app.use('/api', advocateRoutes);
app.use('/api', grantRoutes);
app.use('/api', contactRoutes);
app.use('/api', merchandiseRoutes);
app.use('/api', orderRoutes);
app.use('/api', settingsRoutes);
app.use('/api', publicRoutes);
app.use('/api', casesRoutes);
app.use('/api', teamMembersRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence API" 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize defaults
const User = require('./models/User');
const Settings = require('./models/Settings');
const bcrypt = require('bcryptjs');

async function createDefaults() {
  try {
    // Create default admin
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@admin.com',
        password: hashedPassword,
        full_name: 'Administrator',
        role: 'admin'
      });
      console.log('✅ Default admin created: admin@admin.com / admin123');
    }

    // Create default settings
    const settings = await Settings.findOne({ _id: 'site_settings' });
    if (!settings) {
      await Settings.create({
        _id: 'site_settings',
        site_name: "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence",
        tagline: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        upi_id: '',
        upi_payee_name: '',
        hero_title: '',
        hero_subtitle: '',
        about_mission: '',
        about_vision: '',
        stats_years_of_service: 1,
        stats_cases_resolved: 0,
        resources_hero_title: '',
        resources_hero_description: '',
        resources_content: ''
      });
      console.log('✅ Default site settings created');
    }
  } catch (error) {
    console.error('Error creating defaults:', error);
  }
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});

module.exports = app;


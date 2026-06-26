const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'site_settings'
  },
  site_name: String,
  tagline: String,
  logo_url: String,
  contact_email: String,
  contact_phone: String,
  address: String,
  upi_id: String,
  upi_payee_name: String,
  bank_account_name: String,
  bank_account_number: String,
  bank_ifsc: String,
  bank_name: String,
  bank_branch: String,
  bank_swift: String,
  bank_beneficiary_address: String,
  hero_title: String,
  hero_subtitle: String,
  about_mission: String,
  about_vision: String,
  facebook_url: String,
  twitter_url: String,
  instagram_url: String,
  stats_years_of_service: Number,
  stats_cases_resolved: Number,
  professional_image_url: String,
  professional_name: String,
  professional_title: String,
  professional_bio: String,
  resources_hero_title: String,
  resources_hero_description: String,
  resources_content: String
}, {
  collection: 'settings',
  versionKey: false
});

module.exports = mongoose.model('Settings', settingsSchema);


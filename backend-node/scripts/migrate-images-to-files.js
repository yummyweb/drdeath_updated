require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Settings = require('../models/Settings');
const Story = require('../models/Story');
const Case = require('../models/Case');
const Merchandise = require('../models/Merchandise');
const TeamMember = require('../models/TeamMember');
const Advocate = require('../models/Advocate');

// Helper function to decode base64 and save to file
function saveBase64Image(base64String, outputPath) {
  try {
    // Check if it's a base64 data URL
    if (!base64String || !base64String.startsWith('data:')) {
      return null;
    }

    // Extract mime type and base64 data
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.log('Invalid base64 format:', base64String.substring(0, 50));
      return null;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Determine file extension
    let ext = '.jpg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('gif')) ext = '.gif';
    else if (mimeType.includes('webp')) ext = '.webp';
    
    // Generate unique filename
    const filename = `migrated-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    const fullPath = path.join(outputPath, filename);
    
    // Decode and save
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(fullPath, buffer);
    
    return `/uploads/images/${path.basename(outputPath)}/${filename}`;
  } catch (error) {
    console.error('Error saving base64 image:', error.message);
    return null;
  }
}

async function migrateImages() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'legal_guardian';
    await mongoose.connect(`${mongoUrl}/${dbName}`);
    console.log('✅ Connected to MongoDB');

    // Ensure directories exist
    const directories = {
      settings: 'public/uploads/images/settings',
      stories: 'public/uploads/images/stories',
      cases: 'public/uploads/images/cases',
      merchandise: 'public/uploads/images/merchandise',
      teamMembers: 'public/uploads/images/team-members',
      advocates: 'public/uploads/images/advocates'
    };

    Object.values(directories).forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });

    let migratedCount = 0;

    // Migrate Settings (logo and professional image)
    console.log('\n📸 Migrating Settings images...');
    const settings = await Settings.findOne({ _id: 'site_settings' });
    if (settings) {
      if (settings.logo_url && settings.logo_url.startsWith('data:')) {
        const url = saveBase64Image(settings.logo_url, directories.settings);
        if (url) {
          settings.logo_url = url;
          migratedCount++;
          console.log('  ✅ Migrated logo');
        }
      }
      if (settings.professional_image_url && settings.professional_image_url.startsWith('data:')) {
        const url = saveBase64Image(settings.professional_image_url, directories.settings);
        if (url) {
          settings.professional_image_url = url;
          migratedCount++;
          console.log('  ✅ Migrated professional image');
        }
      }
      await settings.save();
    }

    // Migrate Stories (images array)
    console.log('\n📸 Migrating Story images...');
    const stories = await Story.find({});
    for (const story of stories) {
      if (story.images && Array.isArray(story.images)) {
        const newImages = [];
        for (const img of story.images) {
          if (img && img.startsWith('data:')) {
            const url = saveBase64Image(img, directories.stories);
            if (url) {
              newImages.push(url);
              migratedCount++;
            }
          } else {
            newImages.push(img); // Keep non-base64 URLs
          }
        }
        if (newImages.length !== story.images.length || JSON.stringify(newImages) !== JSON.stringify(story.images)) {
          story.images = newImages;
          await story.save();
        }
      }
    }
    console.log(`  ✅ Migrated ${stories.length} stories`);

    // Migrate Cases (image_url)
    console.log('\n📸 Migrating Case images...');
    const cases = await Case.find({ image_url: { $regex: /^data:/ } });
    for (const caseItem of cases) {
      if (caseItem.image_url && caseItem.image_url.startsWith('data:')) {
        const url = saveBase64Image(caseItem.image_url, directories.cases);
        if (url) {
          caseItem.image_url = url;
          await caseItem.save();
          migratedCount++;
        }
      }
    }
    console.log(`  ✅ Migrated ${cases.length} cases`);

    // Migrate Merchandise (image_url)
    console.log('\n📸 Migrating Merchandise images...');
    const merchandise = await Merchandise.find({ image_url: { $regex: /^data:/ } });
    for (const item of merchandise) {
      if (item.image_url && item.image_url.startsWith('data:')) {
        const url = saveBase64Image(item.image_url, directories.merchandise);
        if (url) {
          item.image_url = url;
          await item.save();
          migratedCount++;
        }
      }
    }
    console.log(`  ✅ Migrated ${merchandise.length} merchandise items`);

    // Migrate Team Members (image_url)
    console.log('\n📸 Migrating Team Member images...');
    const teamMembers = await TeamMember.find({ image_url: { $regex: /^data:/ } });
    for (const member of teamMembers) {
      if (member.image_url && member.image_url.startsWith('data:')) {
        const url = saveBase64Image(member.image_url, directories.teamMembers);
        if (url) {
          member.image_url = url;
          await member.save();
          migratedCount++;
        }
      }
    }
    console.log(`  ✅ Migrated ${teamMembers.length} team members`);

    // Migrate Advocates (profile_image)
    console.log('\n📸 Migrating Advocate images...');
    const advocates = await Advocate.find({ profile_image: { $regex: /^data:/ } });
    for (const advocate of advocates) {
      if (advocate.profile_image && advocate.profile_image.startsWith('data:')) {
        const url = saveBase64Image(advocate.profile_image, directories.advocates);
        if (url) {
          advocate.profile_image = url;
          await advocate.save();
          migratedCount++;
        }
      }
    }
    console.log(`  ✅ Migrated ${advocates.length} advocates`);

    console.log(`\n✅ Migration complete! Migrated ${migratedCount} images total.`);
    console.log('📁 Images saved to: public/uploads/images/');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateImages();

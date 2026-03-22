/**
 * Seed Script: Add Initial CV to Database
 *
 * This script adds a sample CV entry to your MongoDB database.
 *
 * Usage:
 *   1. Place your CV PDF in the public folder (e.g., public/cv.pdf)
 *   2. Update the CV_FILE_PATH below
 *   3. Run: node scripts/seedCV.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration - EDIT THESE VALUES
const CV_DATA = {
  title: 'DevOps Architect - Resume',
  fileUrl: '/cv.pdf', // Path relative to public folder
  version: '1.0.0',
  description: 'Professional CV showcasing DevOps expertise, cloud architecture, and CI/CD experience',
  fileSize: 0, // Will be auto-calculated if file exists
};

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define CV Schema (inline to avoid import issues)
const cvSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  version: { type: String, default: '1.0.0' },
  description: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const CV = mongoose.models.CV || mongoose.model('CV', cvSchema);

async function seedCV() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if CV file exists
    const publicDir = path.join(__dirname, '..', 'public');
    const cvFilePath = path.join(publicDir, CV_DATA.fileUrl.replace(/^\//, ''));

    if (fs.existsSync(cvFilePath)) {
      const stats = fs.statSync(cvFilePath);
      CV_DATA.fileSize = stats.size;
      console.log(`✅ Found CV file: ${cvFilePath} (${(stats.size / 1024).toFixed(2)} KB)`);
    } else {
      console.warn(`⚠️  Warning: CV file not found at ${cvFilePath}`);
      console.warn('   The CV will be created in the database, but the file needs to be added manually.');
    }

    // Deactivate all existing CVs
    await CV.updateMany({}, { isActive: false });
    console.log('📝 Deactivated all existing CVs');

    // Create new CV entry
    const cv = await CV.create(CV_DATA);
    console.log('✅ CV added successfully!');
    console.log('\n📄 CV Details:');
    console.log(`   ID: ${cv._id}`);
    console.log(`   Title: ${cv.title}`);
    console.log(`   Version: ${cv.version}`);
    console.log(`   File URL: ${cv.fileUrl}`);
    console.log(`   File Size: ${(cv.fileSize / 1024).toFixed(2)} KB`);
    console.log(`   Uploaded At: ${cv.uploadedAt}`);
    console.log(`   Status: ${cv.isActive ? 'Active' : 'Inactive'}`);

    console.log('\n🚀 Next Steps:');
    if (!fs.existsSync(cvFilePath)) {
      console.log(`   1. Add your CV file to: ${cvFilePath}`);
    }
    console.log('   2. Start your dev server: npm run dev');
    console.log('   3. Visit: http://localhost:3000/api/cv');

  } catch (error) {
    console.error('❌ Error seeding CV:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the seed function
seedCV();

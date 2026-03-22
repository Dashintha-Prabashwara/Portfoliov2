/**
 * Admin Utility: View Contact Submissions
 *
 * This script allows you to view all contact form submissions from the database.
 * Useful for checking messages during development.
 *
 * Usage: node scripts/viewContacts.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  status: String,
  ipAddress: String,
}, { timestamps: true });

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

async function viewContacts() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(20);

    if (contacts.length === 0) {
      console.log('📭 No contact submissions found.');
      console.log('   Submit test data via: POST http://localhost:3000/api/contact');
      return;
    }

    console.log(`📬 Found ${contacts.length} contact submission(s):\n`);
    console.log('='.repeat(80));

    contacts.forEach((contact, index) => {
      console.log(`\n#${index + 1} | ${contact.status?.toUpperCase() || 'NEW'}`);
      console.log('-'.repeat(80));
      console.log(`📅 Date: ${contact.createdAt?.toLocaleString()}`);
      console.log(`👤 Name: ${contact.name}`);
      console.log(`📧 Email: ${contact.email}`);
      console.log(`💬 Message:\n   ${contact.message}`);
      console.log(`🌐 IP: ${contact.ipAddress || 'N/A'}`);
      console.log(`🆔 ID: ${contact._id}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Displayed ${contacts.length} most recent submissions`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

viewContacts();

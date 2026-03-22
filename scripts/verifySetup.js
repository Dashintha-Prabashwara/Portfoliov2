/**
 * Setup Verification Script
 *
 * This script checks if your portfolio setup is correct before deployment.
 * Run this after initial setup to catch any configuration issues.
 *
 * Usage: node scripts/verifySetup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Portfolio Setup Verification\n');
console.log('='.repeat(60));

let errors = 0;
let warnings = 0;

// Check 1: Environment Variables
console.log('\n📋 Checking environment variables...');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');

  if (envContent.includes('MONGODB_URI=mongodb')) {
    console.log('✅ MONGODB_URI is configured');
  } else {
    console.log('❌ MONGODB_URI is not properly configured');
    errors++;
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('   Run: cp .env.local.example .env.local');
  errors++;
}

// Check 2: Package Dependencies
console.log('\n📦 Checking dependencies...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('✅ package.json exists');

  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ node_modules installed');
  } else {
    console.log('⚠️  node_modules not found');
    console.log('   Run: npm install');
    warnings++;
  }
} else {
  console.log('❌ package.json not found');
  errors++;
}

// Check 3: Required Files
console.log('\n📄 Checking required files...');
const requiredFiles = [
  'app/layout.jsx',
  'app/page.jsx',
  'app/api/contact/route.js',
  'app/api/cv/route.js',
  'lib/mongodb.js',
  'models/Contact.js',
  'models/CV.js',
  'components/ContactForm.jsx',
  'components/CVDownloadButton.jsx',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    errors++;
  }
});

// Check 4: CV File
console.log('\n📄 Checking CV file...');
const cvPath = path.join(__dirname, '..', 'public', 'cv.pdf');
if (fs.existsSync(cvPath)) {
  const stats = fs.statSync(cvPath);
  console.log(`✅ CV file exists (${(stats.size / 1024).toFixed(2)} KB)`);
} else {
  console.log('⚠️  CV file not found at public/cv.pdf');
  console.log('   Add your CV PDF to the public folder');
  warnings++;
}

// Check 5: Configuration Files
console.log('\n⚙️  Checking configuration files...');
const configFiles = [
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'jsconfig.json',
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    errors++;
  }
});

// Check 6: Documentation
console.log('\n📚 Checking documentation...');
const docFiles = ['README.md', 'QUICKSTART.md', 'DEPLOYMENT.md'];
docFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`⚠️  ${file} - Missing`);
    warnings++;
  }
});

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Summary:');
console.log(`   Errors: ${errors}`);
console.log(`   Warnings: ${warnings}`);

if (errors === 0 && warnings === 0) {
  console.log('\n✅ Perfect! Your setup is complete and ready.');
  console.log('\n🚀 Next Steps:');
  console.log('   1. Run: npm install (if not done)');
  console.log('   2. Add CV: node scripts/seedCV.js');
  console.log('   3. Start: npm run dev');
  console.log('   4. Visit: http://localhost:3000');
} else if (errors === 0) {
  console.log('\n⚠️  Setup is functional but some optional items are missing.');
  console.log('   Review warnings above and fix if needed.');
} else {
  console.log('\n❌ Setup has errors that need to be fixed.');
  console.log('   Review errors above and fix them before continuing.');
  console.log('\n💡 Common Fixes:');
  console.log('   - Run: npm install');
  console.log('   - Create: .env.local (copy from .env.local.example)');
  console.log('   - Check: All files are in correct locations');
}

console.log('\n' + '='.repeat(60));
console.log('\n📖 For help, check:');
console.log('   - QUICKSTART.md for setup guide');
console.log('   - README.md for full documentation');
console.log('   - DEPLOYMENT.md for deployment checklist\n');

process.exit(errors > 0 ? 1 : 0);

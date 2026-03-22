# Quick Start Guide

## 🚀 Get Your Portfolio Running in 5 Minutes

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Set Up MongoDB (2 min)

**Option A: MongoDB Atlas (Free, Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (M0 Free Tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

**Option B: Local MongoDB**
```bash
# If you have MongoDB installed locally
MONGODB_URI=mongodb://localhost:27017/portfolio
```

### Step 3: Configure Environment (1 min)
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and paste your MongoDB URI
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
```

### Step 4: Add Your CV (1 min)
```bash
# Place your CV PDF in the public folder
# Example: public/cv.pdf

# Then run the seed script
node scripts/seedCV.js
```

### Step 5: Start Development Server
```bash
npm run dev
```

✅ **Done!** Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Your Setup

### Test Contact Form
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello from the API!"}'
```

### Test CV Endpoint
```bash
curl http://localhost:3000/api/cv
```

### View Contact Submissions
```bash
node scripts/viewContacts.js
```

---

## 🎨 Customize Your Portfolio

1. **Update Personal Info**
   - Edit `app/page.jsx` (lines 43-50 for hero section)
   - Edit `app/page.jsx` (lines 72-89 for contact info)

2. **Change Colors**
   - Edit `tailwind.config.js`

3. **Add Projects/Skills**
   - Add content to sections in `app/page.jsx`

---

## 📝 Common Tasks

### Update CV
1. Replace `public/cv.pdf` with your new file
2. Run: `node scripts/seedCV.js`

### View Contact Messages
```bash
node scripts/viewContacts.js
```

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Then connect repo to Vercel dashboard
# Add MONGODB_URI in environment variables
```

---

## ❓ Need Help?

- MongoDB connection issues? Check `README.md` → Troubleshooting
- API not working? Verify `.env.local` is configured
- Frontend not loading? Run `npm install` again

---

**You're all set! 🎉**

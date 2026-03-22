# DevOps Portfolio - Production Ready

A modern, full-stack portfolio website built with Next.js 14, MongoDB, and Tailwind CSS. Features a contact form, CV management system, and sleek DevOps-themed design.

## 🚀 Features

### Backend
- ✅ **MongoDB Integration** with Mongoose ORM
- ✅ **Connection Caching** optimized for Vercel serverless
- ✅ **Contact Form API** with validation and sanitization
- ✅ **CV Storage & Retrieval** system
- ✅ **Rate Limiting** (in-memory, extendable to Redis)
- ✅ **Spam Protection** using honeypot field
- ✅ **Input Validation** using Zod
- ✅ **Error Handling** with detailed logging
- ✅ **Production-Ready** security practices

### Frontend
- ✅ **Next.js 14 App Router** with React Server Components
- ✅ **Tailwind CSS** with custom design system
- ✅ **Framer Motion** animations
- ✅ **Contact Form** with loading/success/error states
- ✅ **CV Download** component with tracking
- ✅ **Responsive Design** for all devices
- ✅ **Material Icons** integration

---

## 📁 Project Structure

```
portfoliov2/
├── app/
│   ├── api/
│   │   ├── contact/
│   │   │   └── route.js          # Contact form API endpoint
│   │   └── cv/
│   │       └── route.js          # CV retrieval API endpoint
│   ├── layout.jsx                # Root layout with fonts
│   ├── page.jsx                  # Home page
│   └── globals.css               # Global styles with Tailwind
├── components/
│   ├── ContactForm.jsx           # Contact form with validation
│   └── CVDownloadButton.jsx     # CV download button
├── lib/
│   ├── mongodb.js                # MongoDB connection with caching
│   ├── validation.js             # Input validation utilities
│   └── rateLimiter.js            # Rate limiting logic
├── models/
│   ├── Contact.js                # Contact schema
│   └── CV.js                     # CV schema
├── public/                       # Static files (CV PDFs, etc.)
├── scripts/
│   └── seedCV.js                 # Script to add CV to database
├── .env.local.example            # Environment variables template
├── .gitignore
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git

### 2. Clone and Install

```bash
# Navigate to project directory
cd d:/Portfoliov2

# Install dependencies
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

# Optional: Rate limiting configuration
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5

NODE_ENV=development
```

**How to get MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<database>` with your values

### 4. Seed Initial CV Data

Place your CV PDF in the `public/` folder (e.g., `public/cv.pdf`), then run:

```bash
node scripts/seedCV.js
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

---

## 🌐 API Documentation

### Contact Form Endpoint

**POST** `/api/contact`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully!",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "timestamp": "2024-03-22T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "message": ["Message is required"]
  }
}
```

**Rate Limit Response (429):**
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

---

### CV Retrieval Endpoint

**GET** `/api/cv`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "DevOps Architect CV",
    "fileUrl": "/cv.pdf",
    "version": "1.0.0",
    "description": "Latest CV",
    "uploadedAt": "2024-03-22T10:00:00.000Z",
    "downloadCount": 42
  }
}
```

**Not Found Response (404):**
```json
{
  "success": false,
  "error": "No CV available at the moment."
}
```

---

## 🔒 Security Features

1. **Input Validation** - All inputs validated with Zod
2. **Input Sanitization** - XSS prevention via sanitization
3. **Honeypot Field** - Spam bot detection
4. **Rate Limiting** - Prevents abuse (5 requests/minute)
5. **CORS Protection** - Next.js handles CORS automatically
6. **Environment Variables** - Sensitive data never exposed
7. **Error Handling** - No sensitive info in error messages
8. **MongoDB Injection Protection** - Mongoose escapes queries

---

## 🚢 Deployment to Vercel

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Deploy via Git (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Add environment variables:
   - `MONGODB_URI`
   - `RATE_LIMIT_WINDOW_MS` (optional)
   - `RATE_LIMIT_MAX_REQUESTS` (optional)
6. Deploy!

### 3. Deploy via CLI

```bash
vercel
```

Follow the prompts and add your environment variables when asked.

---

## 📝 Usage Examples

### Using the Contact Form Component

```jsx
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div>
      <h1>Get in Touch</h1>
      <ContactForm />
    </div>
  );
}
```

### Using the CV Download Button

```jsx
import CVDownloadButton from '@/components/CVDownloadButton';

export default function Header() {
  return (
    <nav>
      <CVDownloadButton className="custom-class" />
    </nav>
  );
}
```

---

## 🧪 Testing the APIs

### Test Contact Form

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message from the API"
  }'
```

### Test CV Endpoint

```bash
curl http://localhost:3000/api/cv
```

---

## 🎨 Customization

### Change Color Scheme

Edit `tailwind.config.js` to modify the color palette:

```js
colors: {
  primary: "#a4e6ff",    // Cyan
  secondary: "#d8b9ff",   // Purple
  tertiary: "#00f9be",    // Green
  // ... add more colors
}
```

### Update Content

- **Contact Info**: Edit `app/page.jsx` (lines ~222-239)
- **Hero Text**: Edit `app/page.jsx` (lines ~43-50)
- **Footer**: Edit `app/page.jsx` (lines ~94-114)

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Issue:** `MongooseServerSelectionError`

**Solution:**
1. Check your `MONGODB_URI` format
2. Verify database user credentials
3. Whitelist your IP in MongoDB Atlas (Network Access)
4. Ensure database name is correct

### Rate Limiting Not Working

**Issue:** Multiple submissions allowed

**Solution:**
- In serverless environments, use Redis for rate limiting
- Or implement rate limiting at the API Gateway level (Vercel)

### CV Not Found

**Issue:** 404 error when accessing CV

**Solution:**
1. Run seed script: `node scripts/seedCV.js`
2. Verify CV file exists in `public/` folder
3. Check MongoDB connection

---

## 📊 Database Schemas

### Contact Schema
```js
{
  name: String (required, max 100 chars),
  email: String (required, validated),
  message: String (required, max 2000 chars),
  status: String (enum: new/read/replied/archived),
  ipAddress: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### CV Schema
```js
{
  title: String (required),
  fileUrl: String (required),
  version: String,
  description: String,
  downloadCount: Number,
  isActive: Boolean,
  uploadedAt: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🚀 Performance Optimizations

1. **Connection Caching** - Reuses MongoDB connections
2. **SSR & SSG** - Next.js optimizations
3. **Image Optimization** - Next.js Image component ready
4. **CSS Purging** - Tailwind removes unused styles
5. **Code Splitting** - Automatic in Next.js
6. **Edge Caching** - CV endpoint cached for 1 hour

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB + Mongoose
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Validation**: Zod
- **Icons**: Material Symbols
- **Fonts**: Space Grotesk, Inter
- **Deployment**: Vercel

---

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio!

---

## 📄 License

MIT License - Use this code however you like!

---

## 📧 Support

If you have issues, check the troubleshooting section or open an issue.

---

**Built with ❤️ using Next.js and MongoDB**

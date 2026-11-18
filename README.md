# Dashintha Jayawardana - DevOps & Cloud Engineer Portfolio

A modern, high-performance portfolio and technical hub built with **Next.js 15 (App Router)**, **React 18**, **MongoDB**, **Tailwind CSS**, and **Google Gemini AI**. Designed to showcase cloud infrastructure projects, real-time telemetry, certifications, experience, and an interactive AI assistant.

- **👨‍💻 Author:** Dashintha Jayawardana
- **🌐 Live Site:** [https://dashijayawardana.vercel.app/](https://dashijayawardana.vercel.app/)

---

## 🚀 Key Features

### 💻 Modern Full-Stack Architecture
- **Next.js 15 App Router**: Server-side rendering (SSR), dynamic routing, and React Server Components for optimal load speeds and SEO.
- **MongoDB Data Layer**: Cloud-native database persistence for career timeline, projects, credentials, and resume data.
- **Dynamic CV Streaming**: Direct streaming delivery of CV PDFs with real-time download tracking.
- **Interactive AI Chatbot**: Built-in AI assistant powered by Google Gemini and Tavily Search to answer visitor inquiries about experience, technical skills, and projects.

### 🎨 Design & User Experience
- **DevOps/Cyberpunk Aesthetic**: Tailored dark theme with subtle neon accents (Cyan, Purple, Emerald) and glassmorphism cards.
- **Space Grotesk & Inter Typography**: Modern, readable, developer-focused typographic hierarchy.
- **Fluid Micro-Animations**: Smooth interactions, hover effects, and transitions powered by Framer Motion.
- **Fully Responsive**: Optimized layout for mobile, tablet, desktop, and ultra-wide displays.
- **Contact Form**: Email delivery via Resend API with rate-limiting and honeypot spam protection.

---

## 📁 Project Structure

```
Portfoliov2/
├── app/
│   ├── api/
│   │   ├── cv/
│   │   │   ├── route.js            # CV metadata & download tracker
│   │   │   └── download/route.js   # Dynamic PDF streaming endpoint
│   │   ├── experience/route.js     # Career timeline endpoint
│   │   ├── projects/route.js       # Projects showcase endpoint
│   │   ├── certifications/route.js # Certifications endpoint
│   │   ├── education/route.js      # Education records endpoint
│   │   ├── contact/route.js        # Contact email endpoint (Resend)
│   │   ├── chat/route.ts           # Gemini AI Chatbot streaming endpoint
│   │   └── context/route.ts        # Dynamic portfolio context for AI
│   ├── experience/page.jsx         # Career journey & leadership initiatives
│   ├── projects/page.jsx           # Projects grid with tech tags & links
│   ├── certifications/page.jsx     # Verified badges & academic foundation
│   ├── skills/page.jsx             # Technical toolkit & cloud skills
│   ├── contact/page.jsx            # Interactive contact form
│   ├── layout.jsx                  # Root layout, Google fonts, JSON-LD SEO
│   └── page.jsx                    # Hero landing page & tech stack
├── models/
│   ├── Experience.js               # Mongoose schema for career history
│   ├── Project.js                  # Mongoose schema for projects
│   ├── Certification.js            # Mongoose schema for certificates
│   ├── Education.js                # Mongoose schema for academic degrees
│   ├── Cv.js                       # Mongoose schema for CV document
│   └── Contact.js                  # Mongoose schema for contact messages
├── lib/
│   ├── mongodb.js                  # Cached Mongoose connection handler
│   ├── dbData.js                   # Unified data access layer with fallbacks
│   ├── seedData.json               # Seed portfolio dataset
│   ├── email.js                    # Resend email client configuration
│   └── chatbot.ts                  # Chatbot context & web search utilities
└── components/
    ├── Navigation.jsx              # Responsive header navigation
    ├── Footer.jsx                  # Footer with links & status
    ├── Chatbot.tsx                 # Floating interactive AI assistant
    ├── CVDownloadButton.jsx        # Tracked CV download button
    └── ContactForm.jsx             # Validated contact form
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18.17+ or v20+)
- **MongoDB** (A connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local instance)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Dashintha-Prabashwara/Portfoliov2.git
cd Portfoliov2

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory based on `.env.local.example`:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=contact@yourdomain.dev
ADMIN_EMAIL=your-email@example.com

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5

# AI Chatbot - Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash

# Chatbot - Tavily Web Search (Optional)
TAVILY_API_KEY=tvly_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Node Environment
NODE_ENV=development
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/experience` | Retrieves career experience timeline |
| `GET` | `/api/projects` | Retrieves featured and active projects |
| `GET` | `/api/certifications`| Retrieves verified certificates & credentials |
| `GET` | `/api/education` | Retrieves academic education history |
| `GET` | `/api/cv` | Retrieves CV metadata and download statistics |
| `GET` | `/api/cv/download` | Streams the CV PDF directly (supports `?download=true`) |
| `POST`| `/api/contact` | Handles contact form submissions via Resend |
| `POST`| `/api/chat` | AI conversational endpoint powered by Gemini |

---

## 🚀 Deployment

The project is optimized for deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add your environment variables (`MONGODB_URI`, `RESEND_API_KEY`, `ADMIN_EMAIL`, `GEMINI_API_KEY`, etc.).
4. Click **Deploy**.

---

## 🛡️ Security & Performance

- **Optimized Database Queries**: Selective projection on heavy fields to maintain sub-second response times.
- **Connection Caching**: Global connection pooling prevents database connection exhaustion in serverless environments.
- **Spam & Abuse Protection**: Client IP rate limiting and honeypot detection on contact endpoints.
- **SEO & Structured Data**: Built-in JSON-LD Schema (`Person`, `WebSite`), meta tags, dynamic sitemap, and robots.txt.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

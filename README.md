# Dashintha Jayawardana - DevOps & Cloud Architect Portfolio

A modern, high-performance portfolio, technical publication platform, and administrative CMS built with **Next.js 15 (App Router)**, **React 18**, **Hybrid Databases (MongoDB Atlas + TiDB Cloud Serverless MySQL)**, **Tailwind CSS**, and **Google Gemini AI**. Designed to showcase enterprise cloud architectures, CI/CD blueprints, technical articles, verified credentials, and real-time GitHub telemetry.

- **Author:** Dashintha Jayawardana
- **Live Site:** [https://dashijayawardana.vercel.app/](https://dashijayawardana.vercel.app/)

---

## 🚀 Key Features

### 📰 Technical Blog & Publishing Engine
- **Markdown Processing & Parsing:** Powered by `marked` with GitHub-Flavored Markdown (GFM), tables, code blocks, task lists, and soft breaks.
- **Smart Markdown Normalization:**
  - Auto-normalizes header spacing (e.g., `##Heading` → `## Heading`).
  - Cleans loose bold formatting (e.g., `** bold **` → `**bold**`).
  - Pre-formats code fences and headings for standard CommonMark compliance.
  - Strips and extracts YAML frontmatter (`--- title: ... ---`) upon file upload.
- **HTML Sanitization:** Built-in sanitization neutralizing `<script>`, `<iframe>`, `javascript:` URLs, and malicious event handlers.
- **TiDB Cloud Storage:** Relational persistence for blog articles (`blogpost`) and dynamic categories (`blog_category`).
- **Dynamic Category Filtering & Visibility:** Filter articles by category with real-time article counters. Categories set to *Hidden* in the CMS are automatically excluded from the public directory and protected with 404 guards.
- **Metadata & Associations:** Automatic reading time calculation, publication timestamps, and bidirectional linking to specific projects and work experiences.

### ⚙️ Administrative CMS Dashboard (`/admin`)
- **HMAC SHA-256 Authentication:** Secure session management with encrypted cookies and Bearer token fallback.
- **Category Manager:** TiDB Cloud category management (Add, Rename, Toggle Visibility, and Delete).
- **Markdown File Upload:** Direct drag-and-drop or file upload of `.md`, `.markdown`, and `.txt` files with automated frontmatter metadata extraction.
- **Split-View Editor:** Side-by-side or tabbed "Write" and "Live Preview" editor mirroring the public reader interface.
- **Image Upload:** Built-in cover image uploader storing optimized Base64 data URIs directly in TiDB Cloud.
- **Drag-and-Drop Reordering:** Instant visual reordering with automated 3-tier accent color cycling (Primary, Secondary, Tertiary).
- **Full Portfolio Management:** Unified control over Experiences, Projects, Certifications, Education, Blog Posts, Categories, CV, and GitHub Telemetry.

### 🌐 Hybrid Database Architecture
- **MongoDB Atlas (Mongoose):** Manages career timeline, project showcases, verified credentials, education history, contact inquiries, and CV documents.
- **TiDB Cloud Serverless MySQL (mysql2):** Manages technical blog posts, categories, user profiles, and image assets with TLS/SSL encryption and connection pooling.
- **Self-Healing Schema:** Automated table and column verification (`ensureTiDBSchema`) on startup.

### 🤖 Intelligent AI Chatbot
- **Google Gemini Streaming:** Real-time conversational streaming using `gemini-3.6-flash`.
- **RAG & Context Injection:** Dynamic portfolio context aggregation allowing the AI to answer detailed queries about technical stack, career experience, and architecture projects.
- **Tavily Web Search Integration:** Live web retrieval for current DevOps trends, tools, and technical references.

### 📊 Real-Time GitHub Telemetry (`/github`)
- **Contribution Graph:** Visual contribution calendar, commit activity tracking, and repository metrics.
- **Telemetry Cards:** Displays total repositories, stars, language distributions, and recent commit digests.
- **Automated Sync Engine:** Background synchronization via `/api/cron/github-sync` and on-demand sync from the CMS.

### 📄 Dynamic CV Delivery
- **Tracked PDF Streaming:** Direct streaming from MongoDB binary storage via `/api/cv/download` supporting inline viewing and download prompts.
- **Download Telemetry:** Real-time incrementing download counters visible in the CMS dashboard.

---

## 📁 Project Structure

```
Portfoliov2/
├── app/
│   ├── admin/
│   │   └── page.jsx                  # Full-featured Administrative CMS Dashboard
│   ├── api/
│   │   ├── admin/
│   │   │   ├── auth/route.js         # Admin login & session verification
│   │   │   ├── blogs/
│   │   │   │   ├── route.js          # Blog CRUD & reordering
│   │   │   │   ├── categories/       # Category CRUD & visibility toggles
│   │   │   │   └── upload/route.js   # Blog cover image uploader
│   │   │   ├── certifications/       # Certification management
│   │   │   ├── cv/route.js           # CV metadata & file upload
│   │   │   ├── education/route.js    # Academic records management
│   │   │   ├── experiences/route.js  # Career timeline management
│   │   │   ├── github/               # GitHub engine configuration
│   │   │   └── projects/route.js     # Project portfolio management
│   │   ├── blogs/
│   │   │   ├── route.js              # Public blog listing
│   │   │   ├── [id]/route.js         # Single blog retrieval
│   │   │   └── categories/route.js   # Visible categories endpoint
│   │   ├── chat/route.ts             # Gemini AI Chatbot streaming endpoint
│   │   ├── contact/route.js          # Resend contact email handler
│   │   ├── context/route.ts          # Portfolio context for AI
│   │   ├── cron/github-sync/         # Automated GitHub telemetry sync
│   │   ├── cv/
│   │   │   ├── route.js              # CV metadata & statistics
│   │   │   └── download/route.js     # Binary PDF streaming endpoint
│   │   ├── github/route.js           # Public GitHub telemetry data
│   │   └── projects/route.js         # Public projects endpoint
│   ├── blog/
│   │   ├── page.jsx                  # Public blog directory with search & filters
│   │   └── [id]/page.jsx             # Technical article reader with Markdown rendering
│   ├── certifications/page.jsx       # Verified credentials & academic foundation
│   ├── contact/page.jsx              # Interactive contact form
│   ├── experience/page.jsx           # Career timeline & leadership roles
│   ├── github/page.jsx               # GitHub telemetry & activity dashboard
│   ├── projects/page.jsx             # Featured cloud & DevOps projects
│   ├── skills/page.jsx               # Technical toolkit & cloud competencies
│   ├── layout.jsx                    # Root layout, typography & metadata
│   ├── globals.css                   # Tailwind CSS & .blog-content typography
│   └── page.jsx                      # Hero landing page
├── components/
│   ├── BlogView.jsx                  # Client-side blog directory with search & category filters
│   ├── Chatbot.tsx                   # Floating interactive Gemini AI assistant
│   ├── ContactForm.jsx               # Validated contact form with honeypot protection
│   ├── CVDownloadButton.jsx          # Tracked CV download button
│   ├── Footer.jsx                    # Global footer with navigation links
│   ├── GithubTelemetry.jsx           # GitHub telemetry visualizer
│   ├── HeroProfileImage.jsx          # Optimized hero profile avatar
│   └── Navigation.jsx                # Responsive header navigation
├── lib/
│   ├── adminAuth.js                  # HMAC SHA-256 session & authentication utilities
│   ├── chatbot.ts                    # AI context compilation & Tavily search
│   ├── dbData.js                     # Unified MongoDB data layer with fallback datasets
│   ├── email.js                      # Resend email client configuration
│   ├── github.js                     # GitHub REST & GraphQL API client
│   ├── githubSync.js                 # Telemetry sync processor
│   ├── markdown.js                   # Marked parser, normalizer & HTML sanitizer
│   ├── mongodb.js                    # Cached Mongoose connection pool
│   ├── rateLimiter.js                # In-memory IP rate limiter
│   └── tidb.js                       # TiDB Cloud MySQL connection pool & queries
└── models/
    ├── BlogPost.js                   # Mongoose fallback schema for blog posts
    ├── Certification.js              # Mongoose schema for certificates
    ├── Contact.js                    # Mongoose schema for contact messages
    ├── Cv.js                         # Mongoose schema for CV documents & binary data
    ├── Education.js                  # Mongoose schema for academic degrees
    ├── Experience.js                 # Mongoose schema for career history
    ├── GithubConfig.js               # Mongoose schema for GitHub engine settings
    └── Project.js                    # Mongoose schema for showcase projects
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18.17+ or v20+)
- **MongoDB Atlas** cluster or local MongoDB instance
- **TiDB Cloud** Serverless MySQL cluster ([TiDB Cloud](https://tidbcloud.com))

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Dashintha-Prabashwara/Portfoliov2.git
cd Portfoliov2

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory based on `.env.local.example`:

```env
# MongoDB Connection (Profile & Portfolio Data)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority

# TiDB Cloud Serverless MySQL (Technical Blog Engine)
BLOG_DB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
BLOG_DB_PORT=4000
BLOG_DB_USER=your_tidb_user
BLOG_DB_PASSWORD=your_tidb_password
BLOG_DB_NAME=code_canvas

# CMS Admin Security
ADMIN_PASSWORD=your_secure_admin_password_here
ADMIN_AUTH_SECRET=your_random_secret_token_key_here

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=your-email@example.com

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5

# AI Chatbot - Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash

# Chatbot - Tavily Web Search (Optional)
TAVILY_API_KEY=tvly_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# GitHub API Integration (Optional - increases rate limits)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Node Environment
NODE_ENV=development
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Access the CMS Admin at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 📡 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/blogs` | Retrieves all visible blog articles |
| `GET` | `/api/blogs/[id]` | Retrieves a single blog article by ID |
| `GET` | `/api/blogs/categories` | Retrieves all active, visible blog categories |
| `GET` | `/api/projects` | Retrieves showcase projects |
| `GET` | `/api/experience` | Retrieves career experience timeline |
| `GET` | `/api/certifications` | Retrieves verified certifications |
| `GET` | `/api/education` | Retrieves academic history |
| `GET` | `/api/github` | Retrieves cached GitHub telemetry & activity metrics |
| `GET` | `/api/cv` | Retrieves CV metadata and download count |
| `GET` | `/api/cv/download` | Streams CV PDF binary (supports `?download=true`) |
| `POST` | `/api/contact` | Handles contact form submissions with rate limiting |
| `POST` | `/api/chat` | AI conversational endpoint with Gemini streaming |

### Admin Endpoints (Requires Session Cookie or Bearer Token)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/auth` | Verifies admin password and sets auth cookie |
| `DELETE` | `/api/admin/auth` | Clears admin authentication session |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/admin/blogs` | Full CRUD and reordering for blog posts |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/admin/blogs/categories` | Full CRUD and visibility toggle for categories |
| `POST` | `/api/admin/blogs/upload` | Uploads and converts blog cover images |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/admin/projects` | Full CRUD and reordering for projects |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/admin/experiences` | Full CRUD and reordering for experiences |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/admin/certifications` | Full CRUD and reordering for certifications |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/admin/education` | Full CRUD and reordering for education |
| `GET` / `POST` / `DELETE` | `/api/admin/cv` | Manages CV binary PDF upload and metadata |
| `GET` / `PUT` | `/api/admin/github` | Manages GitHub Engine configuration & overrides |
| `POST` | `/api/admin/github/sync` | Triggers immediate GitHub telemetry synchronization |

---

## 🛡️ Security & Performance

- **Dual-Layer Database Architecture:** Splits heavy document persistence (MongoDB) from relational blogging queries (TiDB Cloud), preventing contention.
- **XSS & Content Sanitization:** Markdown HTML output is scrubbed of dangerous tags, script injections, and inline handlers before rendering.
- **Connection Caching:** Global connection pooling for both Mongoose and MySQL prevents serverless connection exhaustion.
- **Rate Limiting & Honeypot:** In-memory sliding-window IP rate limiting and hidden honeypot fields on public contact forms.
- **SEO & Structured Data:** Automatic JSON-LD Schema (`Person`, `WebSite`), OpenGraph metadata, dynamic sitemap generation (`/sitemap.xml`), and robots configuration (`/robots.txt`).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

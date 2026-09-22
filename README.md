# Portfolio v2 - Production Ready

A modern, full-stack portfolio website built with Next.js 15, Notion API, and Tailwind CSS. Features dynamic content from Notion databases, contact form with email service, and responsive design with smooth animations.

**👨‍💻 Built by:** Dashintha Jayawardana
**🔗 Live:** [https://dashijayawardana.vercel.app/](https://dashijayawardana.vercel.app/)

## 🚀 Features

### Backend & Data Management
- ✅ **Notion API Integration** - All portfolio content fetched from Notion databases
- ✅ **Dynamic Content Pages** - Experience, Projects, Education, and Certifications from Notion
- ✅ **Smart Ordering** - Custom "Order" property support with fallback to database order
- ✅ **Zero Caching** - All endpoints use `revalidate: 0` for fresh content
- ✅ **Email Service** - Contact form submissions via Resend
- ✅ **Input Validation** using Zod
- ✅ **Rate Limiting** - Prevents abuse (5 requests/minute)
- ✅ **Spam Protection** using honeypot field
- ✅ **Error Handling** with detailed logging
- ✅ **Production-Ready** security practices

### Frontend & User Experience
- ✅ **Next.js 15 App Router** with React Server Components
- ✅ **Server-Side Rendering (SSR)** for SEO optimization
- ✅ **Tailwind CSS** with custom design system (Cyan, Purple, Green theme)
- ✅ **Framer Motion** smooth animations and transitions
- ✅ **Responsive Design** - Mobile-first approach for all devices
- ✅ **Dark Theme** - Optimized dark-mode UI
- ✅ **Material Icons** integration
- ✅ **Bento Grid Layout** - Modern card-based design

---

## 📁 Project Structure

```
portfoliov2/
├── app/
│   ├── api/
│   │   ├── contact/
│   │   │   └── route.js                    # Contact form API endpoint
│   │   ├── experience/
│   │   │   └── route.js                    # Experience data from Notion
│   │   ├── projects/
│   │   │   └── route.js                    # Projects data from Notion
│   │   ├── education/
│   │   │   └── route.js                    # Education data from Notion
│   │   ├── certifications/
│   │   │   └── route.js                    # Certifications data from Notion
│   │   ├── cv/
│   │   │   └── route.js                    # CV file endpoint (static)
│   │   └── chat/
│   │       └── route.ts                    # Chatbot AI endpoint (Gemini)
│   ├── page.jsx                            # Home page
│   ├── skills/
│   │   ├── page.jsx                        # Skills showcase page
│   │   └── layout.jsx                      # Skills page layout
│   ├── experience/
│   │   ├── page.jsx                        # Experience timeline page
│   │   └── layout.jsx                      # Experience page layout
│   ├── projects/
│   │   ├── page.jsx                        # Projects grid page
│   │   └── layout.jsx                      # Projects page layout
│   ├── contact/
│   │   ├── page.jsx                        # Contact page with form
│   │   └── layout.jsx                      # Contact page layout
│   ├── certifications/
│   │   ├── page.jsx                        # Certifications & education page
│   │   └── layout.jsx                      # Certifications page layout
│   ├── error.jsx                           # App-wide error boundary
│   ├── not-found.jsx                       # 404 page handler
│   ├── layout.jsx                          # Root layout with metadata
│   └── globals.css                         # Global styles with Tailwind
├── components/
│   ├── Navigation.jsx                      # Unified navbar (all pages)
│   ├── ContactForm.jsx                     # Contact form with validation
│   ├── CVDownloadButton.jsx                # CV download button (reused)
│   ├── Footer.jsx                          # Footer with social links
│   ├── ProjectCard.jsx                     # Individual project card
│   ├── AccentBar.jsx                       # Animated gradient bar
│   └── StatusStyles.js                     # Helper for badge styling
├── lib/
│   ├── notion.js                           # Notion API integration
│   ├── constants.js                        # App constants & social links
│   ├── env.js                              # Environment variable validation
│   ├── chatbot.ts                          # Chatbot context & web search
│   ├── validation.js                       # Input validation & HTML escaping
│   └── rateLimiter.js                      # Rate limiting logic
├── public/                                 # Static files
├── .env.local.example                      # Environment variables template
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
- Git
- Notion workspace (for portfolio content)
- Notion API Key
- Resend account (for contact form emails) - Optional

### 2. Clone and Install

```bash
# Navigate to project directory
cd d:/Portfoliov2

# Install dependencies
npm install
```

### 3. Set Up Notion Databases

#### Create Notion Databases & Get IDs

1. **Experience Database**
   - Properties: Title, Role, Company, Start Date, End Date, Description, Tags, Order (number)

2. **Projects Database**
   - Properties: Title, Description, Technologies (multi-select), Image (URL), GitHub URL, Live URL, Status (select), Order (number)

3. **Education Database**
   - Properties: Title, Institution, Description, Start Date, End Date, Tags, Order (number)

4. **Certifications Database**
   - Properties: Title, Organization, Credential ID, Icon (select), Status (select), Issue Date, Expiry Date, Verification URL, Order (number)

#### Get Your Notion API Key

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy your API key
4. Share each database with your integration

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Notion API
NOTION_SECRET=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_EXPERIENCE_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PROJECTS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_EDUCATION_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_CERTIFICATIONS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Chatbot
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
TAVILY_API_KEY=tvly_xxxxxxxxxxxxxxxxxxxxxxxxxxxx (optional, for web search)

# Email Service (Resend)
# Get your API key from https://resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=your-email@example.com

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5

# Node Environment
NODE_ENV=production
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

---

## 🌐 API Documentation

### Experience Endpoint

**GET** `/api/experience`

Fetches all experience items from Notion database, sorted by custom "Order" property.

**Success Response (200):**
```json
[
  {
    "id": "page-id-string",
    "company": "Software Branch",
    "role": "Developer",
    "period": "Aug 2025 - Present",
    "startDate": "Aug 2025",
    "endDate": "Present",
    "description": "Working on IoT Research and development",
    "tags": ["IoT", "Hardware", "Embedded"],
    "color": "primary",
    "align": "left"
  }
]
```

### Projects Endpoint

**GET** `/api/projects`

Fetches all projects from Notion database with technologies and status.

**Success Response (200):**
```json
[
  {
    "id": "page-id-string",
    "title": "AirLux",
    "status": "Production",
    "statusColor": "tertiary",
    "barColor": "from-primary to-primary",
    "description": "E-commerce platform for air quality services",
    "technologies": ["Angular", "Node.js", "MongoDB"],
    "image": "https://...",
    "githubUrl": "https://github.com/...",
    "liveUrl": "https://..."
  }
]
```

### Education Endpoint

**GET** `/api/education`

Fetches education records from Notion database (sorted by custom order).

**Success Response (200):**
```json
[
  {
    "id": "page-id-string",
    "title": "B.Sc. IT & Management",
    "institution": "University of Moratuwa",
    "period": "2023 - PRESENT",
    "startDate": "2023",
    "endDate": "PRESENT",
    "description": "Full-time undergraduate degree program",
    "tags": ["IT", "Management"]
  }
]
```

### Certifications Endpoint

**GET** `/api/certifications`

Fetches certification records from Notion database.

**Success Response (200):**
```json
[
  {
    "id": "page-id-string",
    "title": "AWS Solutions Architect",
    "organization": "Amazon Web Services",
    "status": "Verified",
    "statusColor": "tertiary",
    "credentialId": "ABC123XYZ",
    "icon": "verified",
    "issueDate": "Mar 2024",
    "expiryDate": "Mar 2026",
    "verificationUrl": "https://..."
  }
]
```

**Contact Form Endpoint**

**POST** `/api/contact`

Submits a contact form message (sent via Resend email service).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here",
  "honeypot": ""
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message sent successfully!",
  "data": {
    "id": "email-id",
    "timestamp": "2024-03-23T10:30:00.000Z"
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

### CV Endpoint

**GET** `/api/cv`

Retrieves CV file information (static file from `public/cv.pdf`).

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "title": "Dashintha Jayawardana - CV",
    "fileUrl": "/cv.pdf",
    "description": "Professional CV and Resume"
  }
}
```

---

### Chatbot Endpoint

**POST** `/api/chat`

Sends a message to the AI chatbot powered by Gemini.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about your projects"
    }
  ]
}
```

**Success Response (200):**
Streams text response from Gemini AI

**Error Response (500):**
```json
{
  "success": false,
  "error": "Failed to fetch chat response"
}
```

---

### API Features

- ✅ **Zero Caching** - All endpoints use `Cache-Control: no-cache, no-store`
- ✅ **Force Dynamic** - Always fetches fresh data from Notion
- ✅ **Server Logging** - Console logs show fetch order and custom order property
- ✅ **Fallback Ordering** - Falls back to database order if "Order" property doesn't exist
- ✅ **Error Handling** - Graceful error handling with meaningful messages

## 🔒 Security Features

1. **Input Validation** - All inputs validated with Zod
2. **Input Sanitization** - XSS prevention via HTML escaping
3. **Honeypot Field** - Spam bot detection in contact form
4. **Rate Limiting** - Prevents abuse (5 requests/minute)
5. **CORS Protection** - Next.js handles CORS automatically
6. **Environment Variables** - Sensitive data never exposed (Notion keys, email API)
7. **Error Handling** - No sensitive info in error messages
8. **External Links** - Safe link handling with `rel="noopener noreferrer"`
9. **Server-Side Rendering** - Reduces client-side security risks

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
4. Import your GitHub repository
5. Add environment variables:
   - `NOTION_SECRET`
   - `NOTION_EXPERIENCE_DB`
   - `NOTION_PROJECTS_DB`
   - `NOTION_EDUCATION_DB`
   - `NOTION_CERTIFICATIONS_DB`
  - `GEMINI_API_KEY`
   - `TAVILY_API_KEY` (optional)
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `RATE_LIMIT_WINDOW_MS` (optional)
   - `RATE_LIMIT_MAX_REQUESTS` (optional)
6. Deploy!

### 3. Deploy via CLI

```bash
vercel
```

Follow the prompts and add your environment variables when asked.

---

## 💻 Key Components Overview

### `/lib/notion.js`
The heart of the integration. Contains four main functions:

```javascript
export async function getExperience() // Fetch experience timeline
export async function getProjects()   // Fetch project portfolio
export async function getEducation()  // Fetch education records
export async function getCertifications() // Fetch certificates
```

Each function:
- Queries the corresponding Notion database
- Attempts to sort by custom "Order" property
- Falls back to default order if property doesn't exist
- Logs fetch progress with `✅` indicator
- Returns formatted data for frontend consumption

### API Routes (`/app/api/**/route.js`)
All API endpoints:
- Use `revalidate: 0` - Zero caching
- Use `dynamic: 'force-dynamic'` - Always fresh
- Set `Cache-Control: no-cache, no-store` headers
- Include error handling and logging

### `/components/Navigation.jsx`
Unified navbar used across all pages:
- Active link highlighting
- Responsive mobile menu
- Navigation to all 6 pages
- Logo/branding

### `/components/ContactForm.jsx`
Contact form component:
- Zod validation
- Honeypot spam protection
- Loading/success/error states
- Rate limiting (5 requests/minute)
- Integrates with Resend email service

---

## 🔧 Adding New Content

### To Add a New Experience Item:

1. Open your Experience database in Notion
2. Click "New" to add a page
3. Fill in: Role, Company, Start Date, End Date, Description, Tags
4. Set Order: `[next number]`
5. Refresh portfolio - changes appear instantly!

### To Add a New Project:

1. Open your Projects database in Notion
2. Click "New" to add a page
3. Fill in: Title, Description, Technologies, Image URL, Status
4. Add GitHub URL and Live URL (optional)
5. Set Order: `[next number]`
6. Changes sync automatically!

### To Add Education:

1. Open Education database in Notion
2. Add: Title, Institution, Description, Dates, Tags, Order
3. Changes appear on certification page automatically

### To Add Certifications:

1. Open Certifications database in Notion
2. Add: Title, Organization, Status, Issue Date, Credential ID, Verification URL, Order
3. Status controls badge styling and color

---

## 🧪 Testing the APIs

### Test Experience Endpoint

```bash
curl http://localhost:3000/api/experience
```

### Test Projects Endpoint

```bash
curl http://localhost:3000/api/projects
```

### Test Education Endpoint

```bash
curl http://localhost:3000/api/education
```

### Test Certifications Endpoint

```bash
curl http://localhost:3000/api/certifications
```

### Test Contact Form

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message",
    "honeypot": ""
  }'
```

---

## 📚 Notion Best Practices

### Database Organization

1. **Use the Order Property**
   - Add a "Number" property called "Order"
   - Set values 1, 2, 3, etc. for custom sorting
   - Fallback to database order if not present

2. **Property Naming**
   - Keep property names exactly as shown in schemas
   - Names are case-sensitive
   - Required: Title for most databases

3. **Multi-select Tags**
   - Use for technologies, skills, tags
   - Helps with filtering and organization
   - Appears on project/experience cards

4. **Rich Text for Descriptions**
   - Supports formatting (bold, italic, links)
   - Displays beautifully in portfolio
   - Keep descriptions concise

5. **Status & Icon Selects**
   - Status: Production, Active, Archived
   - Icons: verified, completed, in-progress
   - Controls styling and badge appearance

## 📝 Page Structure Overview

### Pages Available

1. **Home** (`/`)
   - Hero section with introduction
   - Skills/About me section (Bento Grid)
   - Tech stack showcase
   - Quick navigation to other pages

2. **Skills** (`/skills`)
   - Comprehensive skill categories
   - Web/Frontend, AWS & Cloud, Backend, Development Tools
   - System status bar with animations

3. **Experience** (`/experience`)
   - Timeline of professional experience
   - Leadership roles and projects
   - Dynamic content from Notion

4. **Projects** (`/projects`)
   - Portfolio projects grid
   - Project cards with tech stack
   - Links to GitHub and live demos
   - Status badges (Production, Active, etc.)

5. **Contact** (`/contact`)
   - Contact form with validation
   - CI/CD pipeline visualization
   - Infrastructure context cards
   - Email integration via Resend

6. **Certifications** (`/certifications`)
   - Education timeline
   - Verified credentials grid
   - Credential verification links
   - Status indicators

---

## 🎨 Customization

### Update Social Links

Edit `/lib/constants.js`:

```javascript
export const SOCIAL_LINKS = {
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourprofile',
  twitter: 'https://twitter.com/yourhandle',
  email: 'your-email@example.com',
};
```

### Change Color Scheme

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: "#a4e6ff",      // Cyan
  secondary: "#d8b9ff",    // Purple
  tertiary: "#00f9be",     // Green
  surface: "#131313",      // Background
  'on-surface': "#e5e2e1", // Text
}
```

### Update Navigation

Edit `/components/Navigation.jsx` to customize the navbar links and styling.

### Customize Home Page Content

Edit `/app/page.jsx` to modify:
- Hero text and introduction
- Skills/About section
- Tech stack items
- Footer information

---

## 🐛 Troubleshooting

### Notion Connection Failed

**Issue:** `Error fetching experience from Notion`

**Solution:**
1. Verify `NOTION_SECRET` is correct and active
2. Ensure database IDs are correct:
   - `NOTION_EXPERIENCE_DB`
   - `NOTION_PROJECTS_DB`
   - `NOTION_EDUCATION_DB`
   - `NOTION_CERTIFICATIONS_DB`
3. Check that the integration is shared with all databases
4. Verify database properties exist (Title, Order, etc.)

### Content Not Appearing

**Issue:** API endpoints return empty arrays

**Solution:**
1. Check database has content added
2. Verify property names match exactly (case-sensitive)
3. Check Notion API key is active: [My Integrations](https://www.notion.so/my-integrations)
4. Review server logs: `npm run dev` shows fetch logs with `✅` indicator

### Custom Ordering Not Working

**Issue:** Items appear in wrong order

**Solution:**
1. Add `Order` property (Number type) to your Notion database
2. Set custom order values (1, 2, 3, etc.)
3. Items will auto-sort by this property
4. Without `Order` property, database's default order is used
5. Server logs show: `(Order: X)` if using custom order

### Contact Form Not Sending

**Issue:** Form submission fails or emails not received

**Solution:**
1. Verify Resend API key is valid: [Resend Dashboard](https://resend.com)
2. Check `ADMIN_EMAIL` is correct
3. Verify email hasn't bounced
4. Check spam folder for test emails
5. Review rate limiting: default is 5 requests/minute

### Rate Limiting Issues

**Issue:** Getting 429 errors on contact form

**Solution:**
- Adjust `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` in `.env.local`
- For production, consider using Redis for distributed rate limiting
- Current implementation is in-memory (per-server)

---

## 📊 Notion Database Schemas

### Experience Database
```
Title:        Role (Text)
Company:      Company name (Text)
Start Date:   Date field
End Date:     Date field
Description:  Rich text field
Tags:         Multi-select (IoT, Hardware, etc.)
Order:        Number (for custom ordering)
```

### Projects Database
```
Title:           Project name (Text)
Description:     Rich text field
Technologies:    Multi-select (Angular, React, Node.js, etc.)
Image:           URL field (project image)
GitHub URL:      URL field
Live URL:        URL field
Status:          Select (Production, Active, Archived)
Order:           Number (for custom ordering)
```

### Education Database
```
Title:           Degree/Course name (Text)
Institution:     Institution name (Text)
Description:     Rich text field
Start Date:      Date field
End Date:        Date field
Tags:            Multi-select (IT, Management, etc.)
Order:           Number (for custom ordering)
```

### Certifications Database
```
Title:           Certification name (Text)
Organization:    Organization name (Text)
Credential ID:   ID/Number (Text)
Icon:            Select (verified, completed, in-progress)
Status:          Select (Verified, Expired, In Progress)
Issue Date:      Date field
Expiry Date:     Date field
Verification URL: URL field
Order:           Number (for custom ordering)
```

**Note:** The `Order` property is optional. If it exists, items are sorted by it. Otherwise, database default order is used.

---

## 📚 Notion Best Practices

### Database Organization

1. **Use the Order Property**
   - Add a "Number" property called "Order"
   - Set values 1, 2, 3, etc. for custom sorting
   - Fallback to database order if not present

2. **Property Naming**
   - Keep property names exactly as shown in schemas
   - Names are case-sensitive
   - Required: Title for most databases

3. **Multi-select Tags**
   - Use for technologies, skills, tags
   - Helps with filtering and organization
   - Appears on project/experience cards

4. **Rich Text for Descriptions**
   - Supports formatting (bold, italic, links)
   - Displays beautifully in portfolio
   - Keep descriptions concise

5. **Status & Icon Selects**
   - Status: Production, Active, Archived
   - Icons: verified, completed, in-progress
   - Controls styling and badge appearance

---

## 🚀 Performance Optimizations

1. **Zero Caching Strategy** - API endpoints always fetch fresh data from Notion
2. **Server-Side Rendering (SSR)** - Initial page loads are rendered on server
3. **Dynamic Content Loading** - Pages fetch Notion data at build/request time
4. **CSS Purging** - Tailwind removes unused styles in production
5. **Code Splitting** - Automatic route-based code splitting in Next.js
6. **Image Optimization** - Next.js Image component ready for optimization
7. **Response Compression** - Vercel automatically compresses responses
8. **Server Components** - React Server Components reduce client bundle size

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
4. Import your GitHub repository
5. Add environment variables:
   - `NOTION_SECRET`
   - `NOTION_EXPERIENCE_DB`
   - `NOTION_PROJECTS_DB`
   - `NOTION_EDUCATION_DB`
   - `NOTION_CERTIFICATIONS_DB`
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `RATE_LIMIT_WINDOW_MS` (optional)
   - `RATE_LIMIT_MAX_REQUESTS` (optional)
6. Click "Deploy"

### 3. Deploy via CLI

```bash
vercel
```

Follow the interactive prompts and add environment variables when asked.

### 4. Post-Deployment

- Verify Notion integration is still connected
- Test all API endpoints at your domain
- Check that contact form sends emails
- Monitor server logs for errors

---

## 📈 Production Checklist

- [ ] Notion databases created and populated
- [ ] Notion API key added to environment
- [ ] All database IDs correctly configured
- [ ] Gemini API key set up (https://aistudio.google.com/apikey)
- [ ] Resend account set up with API key
- [ ] Admin email verified in Resend
- [ ] CV PDF file placed at `public/cv.pdf`
- [ ] Social links updated in constants.js
- [ ] Contact form tested end-to-end
- [ ] Chatbot responding correctly
- [ ] All pages display correctly
- [ ] Mobile responsive design verified
- [ ] Performance tested (Lighthouse)
- [ ] Security headers configured
- [ ] Analytics set up (if desired)

---

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11.0
- **Data Source**: Notion API (Dynamic CMS)
- **Chatbot**: Gemini AI (streaming responses)
- **Email Service**: Resend (Contact form)
- **Search**: Tavily API (Web search for chatbot)
- **Validation**: Zod 3.23
- **Icons**: Material Symbols
- **Fonts**: Space Grotesk, Inter
- **Deployment**: Vercel (production)
- **Version Control**: Git + GitHub

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

**Built with ❤️ using Next.js, Notion, and Vercel**

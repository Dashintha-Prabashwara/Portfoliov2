# Deployment Checklist ✅

Use this checklist before deploying to production.

## Pre-Deployment

### Environment Setup
- [ ] MongoDB Atlas cluster created and configured
- [ ] IP whitelist updated (0.0.0.0/0 for Vercel or specific IPs)
- [ ] Database user created with appropriate permissions
- [ ] `.env.local` configured with production MongoDB URI

### Code Review
- [ ] All API endpoints tested locally
- [ ] Contact form validated (success, error, rate limit cases)
- [ ] CV download working correctly
- [ ] No console errors in browser
- [ ] No sensitive data in code (API keys, passwords, etc.)
- [ ] `.gitignore` includes `.env.local` and `.env`

### Content
- [ ] CV PDF added to `public/` folder
- [ ] CV seeded in database (`node scripts/seedCV.js`)
- [ ] Personal information updated in `app/page.jsx`
- [ ] Email address updated
- [ ] Social links updated (GitHub, LinkedIn, Twitter)
- [ ] Footer copyright year updated

### Styling & UX
- [ ] Responsive design tested on mobile
- [ ] All animations working smoothly
- [ ] Loading states visible
- [ ] Error messages user-friendly
- [ ] Success messages clear

## Vercel Deployment

### Initial Setup
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub

### Environment Variables (Critical!)
Add these in Vercel Dashboard → Settings → Environment Variables:

```
MONGODB_URI = mongodb+srv://...
RATE_LIMIT_WINDOW_MS = 60000
RATE_LIMIT_MAX_REQUESTS = 5
NODE_ENV = production
```

- [ ] `MONGODB_URI` added to Vercel
- [ ] All required environment variables added
- [ ] Environment variables applied to Production, Preview, Development

### Build Configuration
- [ ] Build command: `next build` (default)
- [ ] Output directory: `.next` (default)
- [ ] Node version: 18.x or higher

### Domain Setup (Optional)
- [ ] Custom domain added
- [ ] DNS configured
- [ ] SSL certificate active

## Post-Deployment Testing

### API Tests
Test these endpoints on your production URL:

```bash
# Replace YOUR_DOMAIN with your Vercel URL

# Test CV endpoint
curl https://YOUR_DOMAIN.vercel.app/api/cv

# Test contact form
curl -X POST https://YOUR_DOMAIN.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Testing production API"}'
```

- [ ] CV endpoint returns correct data
- [ ] Contact form accepts valid submissions
- [ ] Rate limiting works (test multiple submissions)
- [ ] Honeypot field blocks spam
- [ ] Error handling works properly

### Frontend Tests
- [ ] Homepage loads correctly
- [ ] Contact form submits successfully
- [ ] CV download button works
- [ ] Success/error messages display
- [ ] Mobile responsiveness verified
- [ ] All links work (social media, navigation)

### Database Verification
- [ ] Contact submissions appear in MongoDB
- [ ] CV data is correct
- [ ] No connection errors in Vercel logs

## Performance & SEO

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] Images optimized
- [ ] Fonts loaded efficiently

### SEO
- [ ] Meta tags configured (`app/layout.jsx`)
- [ ] Title and description accurate
- [ ] Open Graph tags added (optional)
- [ ] Sitemap generated (optional)
- [ ] robots.txt configured (optional)

## Monitoring

### Vercel Dashboard
- [ ] Monitor function execution times
- [ ] Check for errors in logs
- [ ] Monitor bandwidth usage
- [ ] Track deployment history

### MongoDB Atlas
- [ ] Monitor connection count
- [ ] Check for slow queries
- [ ] Set up alerts for high usage
- [ ] Review security settings

## Security Final Check

- [ ] No API keys in frontend code
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Honeypot field implemented
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS configured properly
- [ ] No sensitive data in logs

## Launch! 🚀

Once all items are checked:
- [ ] Share portfolio URL
- [ ] Update LinkedIn/resume with link
- [ ] Test from different devices/networks
- [ ] Monitor first 24 hours for issues

## Maintenance

### Weekly
- [ ] Check contact form submissions
- [ ] Review error logs
- [ ] Monitor performance metrics

### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Review MongoDB usage
- [ ] Check Vercel analytics
- [ ] Backup database (export contacts)

### As Needed
- [ ] Update CV (re-run seed script)
- [ ] Add new projects/content
- [ ] Refresh design/colors
- [ ] Optimize based on feedback

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Next.js: https://nextjs.org/docs

**Deployment Issues?**
- Check Vercel function logs
- Verify environment variables
- Test MongoDB connection string
- Review README.md troubleshooting section

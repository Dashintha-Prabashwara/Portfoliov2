# Production-Grade Chatbot Backend – Setup Guide

Your portfolio chatbot is now upgraded to production-grade with edge runtime, streaming responses, and intelligent token trimming.

## ✅ What's New

### 1. **Edge Runtime** ⚡
- Both `/api/context` and `/api/chat` run on edge (Vercel Edge Functions)
- Faster response times, globally distributed
- No Node.js-only APIs (fully compatible)

### 2. **Smart Token Trimming** 📊
- Context automatically capped at 12,000 tokens (~48KB)
- Preserves most important portfolio sections
- Prevents API rate limits and ensures fast responses

### 3. **Streaming Responses** 🔄
- Responses stream in real-time like ChatGPT
- Chunks arrive live to the UI
- Better UX, lower perceived latency

### 4. **Performance Optimizations** 🚀
- Parallel page scraping (Promise.all)
- 5s fetch timeout per page via AbortController
- 15s total request timeout for API calls
- 24-hour cache with automatic refresh

### 5. **Live Portfolio Data** 📝
- Bot automatically scrapes `/skills`, `/experience`, `/projects`, `/certifications`
- Updates every 24 hours automatically
- Single source of truth (no manual data maintenance)

---

## 🛠 Setup Instructions

### Step 1: Get Gemini API Key

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Click **"Create API key"**
3. Copy your API key

### Step 2: Add to Environment

Open `.env.local` and fill in your key:

```env
GEMINI_API_KEY=your_api_key_here
```

### Step 3: Test Locally

```bash
npm run dev
```

Then open http://localhost:3000/api/context to verify context scraping works.

### Step 4: Deploy

Push to Vercel as usual:

```bash
git add .
git commit -m "Add production chatbot backend"
git push
```

Vercel automatically detects edge routes and deploys them.

---

## 📁 File Structure

```
app/
├── api/
│   ├── context/
│   │   └── route.ts           # Fetches & caches portfolio context (edge)
│   └── chat/
│       └── route.ts           # Streams AI response (edge)
└── ...

lib/
└── chatbot.ts                 # Utilities: scraping, token trimming, summarization

Downloads/
└── dashintha-bot.html         # Updated HTML chatbot (uses /api/chat)
```

---

## 🔌 API Endpoints

### GET `/api/context`

Returns cached portfolio context.

**Response:**
```json
{
  "context": "=== /skills ===\nAngular, React, Next.js...\n=== /experience ===\n..."
}
```

**Caching:**
- Cached for 24 hours
- Scrapes all 4 portfolio pages in parallel
- Auto-trims if >12K tokens

---

### POST `/api/chat`

Streams AI response using portfolio context.

**Request:**
```json
{
  "messages": [
    { "role": "user", "parts": [{ "text": "Tell me about your projects" }] },
    { "role": "model", "parts": [{ "text": "Your projects are..." }] }
  ]
}
```

**Response:** `text/event-stream` (streaming chunks)

---

## 💡 How It Works

1. **User asks a question** in the chat widget
2. **Frontend calls `/api/chat`** with chat history
3. **Backend fetches `/api/context`** (cached portfolio data)
4. **System prompt combines** portfolio data + user query
5. **Gemini generates response**, streamed back to frontend
6. **Chunks render live** in the UI (like ChatGPT typing)
7. **Chat history stored** locally for follow-up questions

---

## 🎯 Optimization Notes

### Context Scraping
- **Parallel fetching**: All 4 pages fetched simultaneously
- **Timeout protection**: 5s per page, 15s total
- **Smart summarization**: If >12K tokens, keeps most important content
- **Cache invalidation**: 24-hour TTL

### Token Trimming Strategy
- Estimates tokens: `text.length / 4`
- If trimming needed: Splits by sentences, keeps as much as fits
- Preserves all section headers for clarity

### Streaming
- **Chunk size**: 30 characters per chunk
- **Connection**: `text/event-stream` with `keep-alive`
- **Error handling**: Timeouts, API errors, malformed responses

---

## ⚠️ Important Notes

1. **API Key Security**: Never commit your GEMINI_API_KEY to git. It's in `.env.local` which is gitignored.

2. **Portfolio URLs**: The bot scrapes your live portfolio at `dashijayawardana.vercel.app`. Make sure your deployment is live!

3. **Rate Limits**: Gemini free tier has limits. Monitor usage in [Google AI Studio](https://aistudio.google.com/app/apikey).

4. **Edge Limitations**: Edge functions have a 10MB size limit. Current codebase is ~2MB.

---

## 🧪 Testing

### Test Context Scraping
```bash
curl http://localhost:3000/api/context
```

### Test Chat Streaming
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","parts":[{"text":"Who are you?"}]}]}'
```

---

## 📊 Monitoring

Check deployment health:

1. **Vercel Dashboard**: https://vercel.com/dashboard
2. **Function Logs**: Each edge function has logs in Vercel
3. **Error Tracking**: Check toast notifications in the bot UI

---

## 🚀 Performance Metrics (Expected)

- **Context fetch**: ~800ms (all pages scraped in parallel)
- **Chat response**: ~1.5s (TTFB for first chunk)
- **Streaming**: ~2-3s total (chunks arrive live)
- **Cache hit**: ~50ms (served from global cache)

---

## 📝 Example Prompts to Test

1. "What are your top skills?"
2. "Tell me about your projects"
3. "What's your experience?"
4. "What certifications do you have?"
5. "Can you help me with React?" (tests GENERAL MODE)
6. "What's the capital of France?" (tests GENERAL MODE)

---

## 🐛 Troubleshooting

### Bot says "API key not configured"
- Add `GEMINI_API_KEY` to `.env.local`
- Restart dev server: `npm run dev`

### Responses are slow
- Check if context scraping is timing out (see `/api/context`)
- Verify your portfolio is deployed and live

### Streaming doesn't work in some browsers
- Ensure `ReadableStream` is supported (modern browsers only)
- Test in Chrome/Firefox first

### Context doesn't update
- Cache TTL is 24 hours
- Force refresh by restarting the app
- Or modify TTL in `/lib/chatbot.ts`

---

## 📚 Resources

- [Gemini API Docs](https://ai.google.dev/)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/api-routes/edge-runtime)
- [ReadableStream API](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
- [Cheerio Scraping](https://cheerio.js.org/)

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-03-28
**Chatbot Lives At**: `http://localhost:3000/api/chat` (backend only)

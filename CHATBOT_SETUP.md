# Production-Grade Chatbot Backend – Setup Guide

Your portfolio chatbot is now upgraded to production-grade with streaming responses, and intelligent context from your portfolio pages.

## ✅ What's Included

### 1. **Groq AI Integration** ⚡
- Uses Groq API for fast, intelligent responses
- Streaming responses in real-time like ChatGPT
- Natural language understanding of your portfolio content

### 2. **Smart Context System** 📊
- Automatically scrapes portfolio content from your pages
- Caches context for better performance
- Updates periodically for fresh data

### 3. **Streaming Responses** 🔄
- Responses stream in real-time like ChatGPT
- Chunks arrive live to the UI
- Better UX, lower perceived latency

### 4. **Web Search Integration** 🔍
- Optional Tavily API for web search
- Enables chatbot to answer questions about current events
- Falls back to portfolio content when search not available

### 5. **Live Portfolio Data** 📝
- Bot automatically scrapes `/skills`, `/experience`, `/projects`, `/certifications`
- Updates cache based on configuration
- Single source of truth (no manual data maintenance)

---

## 🛠 Setup Instructions

### Step 1: Get Groq API Key

1. Go to **[Groq Console](https://console.groq.com/keys)**
2. Sign up or log in
3. Click **"Create API key"**
4. Copy your API key

### Step 2: (Optional) Get Tavily API Key for Web Search

1. Go to **[Tavily](https://tavily.com)**
2. Sign up and get your API key
3. This enables web search in your chatbot (optional feature)

### Step 3: Add to Environment

Open `.env.local` and fill in your keys:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here (optional)
```

### Step 4: Test Locally

```bash
npm run dev
```

Then open http://localhost:3000 and use the chatbot widget in the corner.

### Step 5: Deploy

Push to Vercel as usual:

```bash
git add .
git commit -m "Update chatbot to production"
git push
```

Vercel automatically deploys your changes.

---

## 📁 File Structure

```
app/
├── api/
│   └── chat/
│       └── route.ts           # Streams AI response (Groq)
└── ...

components/
└── Chatbot.tsx                # Chat widget UI

lib/
├── chatbot.ts                 # Context scraping, web search utilities
├── validation.js              # Input validation
└── constants.js               # App constants

public/
└── cv.pdf                      # Your CV file
```

---

## 🔌 API Endpoints

### POST `/api/chat`

Streams AI response using Groq with portfolio context.

**Request:**
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

**Response:** `text/event-stream` (streaming chunks)

**Features:**
- Automatically includes your portfolio content as context
- Web search enabled if Tavily API key configured
- Streaming responses for real-time feedback

---

## 💡 How It Works

1. **User asks a question** in the chat widget
2. **Frontend sends message** to `/api/chat` with chat history
3. **Backend retrieves portfolio context** (cached from your pages)
4. **System prompt combines** portfolio data + web search (optional) + user query
5. **Groq AI generates response** based on context
6. **Response streams** back to frontend in real-time
7. **Chat history stored** locally for follow-up questions

---

## 🎯 Features & Settings

### Chatbot Behavior
- **Temperature**: 0.7 (natural, conversational responses)
- **Max Tokens**: 1024 (comprehensive answers)
- **Timeout**: 15 seconds (dev), 10 seconds (production)
- **Streaming**: Enabled for real-time responses

### Context Sources
- Portfolio pages: `/skills`, `/experience`, `/projects`, `/certifications`
- Web search results (if Tavily API key provided)
- Chat history for multi-turn conversations

### Error Handling
- Graceful fallbacks if API is slow
- Readable error messages in UI
- Rate limiting protection

---

## ⚠️ Important Notes

1. **API Key Security**: Never commit your GROQ_API_KEY to git. It's in `.env.local` which is gitignored.

2. **Groq Free Tier**: Has rate limits. Monitor usage in [Groq Console](https://console.groq.com).

3. **Portfolio URLs**: The bot scrapes your live portfolio pages and Notion content. Make sure your deployment is live!

4. **Tavily API** (Optional): Only needed if you want web search functionality in the chatbot.

5. **Development vs Production**:
   - Dev: 15s timeout, http://localhost:3000
   - Production: 10s timeout, https://yoursite.com

---

## 🧪 Testing

### Test Chat Streaming
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Who are you?"}]}'
```

### Manual Testing
1. Open your portfolio locally (`npm run dev`)
2. Click the chatbot icon in the bottom-right corner
3. Test questions:
   - "What are your top skills?"
   - "Tell me about your projects"
   - "What's your experience?"
   - "Can you help me with React?"

---

## 📊 Monitoring

Check deployment health:

1. **Vercel Dashboard**: https://vercel.com/dashboard
2. **Function Logs**: Check logs in Vercel for `/api/chat` endpoint
3. **Browser Console**: Check for errors when chatting
4. **Toast Notifications**: UI shows errors like "Failed to fetch chat response"

---

## 🐛 Troubleshooting

### Bot says "API key not configured"
- Add `GROQ_API_KEY` to `.env.local`
- Restart dev server: `npm run dev`
- Make sure key is valid from https://console.groq.com

### Responses are slow or timing out
- Check if Groq API is responding: Test in [Groq Console](https://console.groq.com)
- Verify your portfolio pages are accessible
- Try simpler questions first

### Chatbot not appearing
- Check browser console for errors
- Clear cache and reload
- Make sure Chatbot component is imported in layout

### "Too many requests" error
- Groq has rate limits on free tier
- Wait a moment and try again
- Consider upgrading Groq plan for higher limits

### Web search not working (if Tavily enabled)
- Verify `TAVILY_API_KEY` is set in `.env.local`
- Check Tavily dashboard for quota
- Bot will still work without it (uses portfolio content only)

---

## 📚 Resources

- [Groq API Docs](https://console.groq.com/docs)
- [Next.js Streaming API Routes](https://nextjs.org/docs/app/api-routes/route-handlers)
- [Tavily Search API](https://tavily.com/docs)
- [ReadableStream API](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)

---

## 🚀 Performance Metrics (Expected)

- **Chat response**: ~1-2s (TTFB for first chunk)
- **Streaming**: ~2-4s total (chunks arrive live)
- **Average response time**: ~3s for full answer
- **Cache hit**: ~100ms if cache available

---

## 📝 Example Prompts to Test

1. "What are your top skills?"
2. "Tell me about your projects"
3. "What's your professional experience?"
4. "What certifications do you have?"
5. "Can you help me with React?" (general knowledge)
6. "What's the latest in AI?" (requires web search)

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-03-29
**Chatbot Lives At**: `http://localhost:3000` (bottom-right corner)
**Backend**: `/api/chat` (Groq streaming endpoint)


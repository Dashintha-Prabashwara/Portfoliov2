import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioContext } from '@/lib/chatbot';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// Validate API key at module load
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not configured. Chat functionality will be disabled.');
}

interface Message {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

/**
 * Build system prompt with portfolio context
 * Enhanced to match response style of popular AI models like Claude, ChatGPT, etc.
 */
async function buildSystemPrompt(): Promise<string> {
  const context = await getPortfolioContext();

  const systemPrompt = `You are Claude, an AI assistant on Dashintha Jayawardana's portfolio website.

DUAL-MODE:
1. PORTFOLIO MODE: Answer questions about Dashintha using context below
2. GENERAL MODE: Answer other questions without mentioning the portfolio

--- DASHINTHA'S PORTFOLIO CONTEXT ---

${context}

--- CONTACT INFO ---
Email: contact@dashijay.dev
GitHub: https://github.com/Dashintha-Prabashwara
LinkedIn: https://linkedin.com/in/dashintha-jayawardana-7b740b26b
Contact Page: https://dashijayawardana.vercel.app/contact

--- RESPONSE STYLE ---
- Be conversational and natural
- Use **bold** for emphasis
- Use - for bullet points (NOT ▸ or *)
- For projects: describe as stories, weave tech naturally
- For code: provide full, working examples with \`\`\`language tags
- Keep responses concise and scannable
- DON'T append portfolio info to general questions
- DON'T use artificial section headers
- Match user's tone and technical level`;

  return systemPrompt;
}

/**
 * Stream response from Gemini API
 */
async function* streamGeminiResponse(
  messages: Message[],
  systemPrompt: string
): AsyncGenerator<string> {
  if (!GEMINI_API_KEY) {
    yield 'Error: GEMINI_API_KEY not configured';
    return;
  }

  const contents = [
    ...messages
      .filter((msg) => msg.parts && msg.parts.length > 0)
      .map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts[0]?.text || '' }],
      })),
  ];

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15s

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const msg = error?.error?.message || `HTTP ${response.status}`;

      if (response.status === 400 || response.status === 401 || response.status === 403) {
        yield `Error: ${msg}`;
      } else if (response.status === 404) {
        yield `Error: Gemini model unavailable: ${msg}`;
      } else if (response.status === 429) {
        yield 'Error: Too many requests — please wait a moment';
      } else {
        yield `Error: ${msg}`;
      }
      return;
    }

    if (!response.body) {
      yield 'Error: No response body';
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || line.startsWith(':')) continue;
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6);
        if (data === '[DONE]') break;

        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (chunk) yield chunk;
        } catch {
          // Ignore parsing errors
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      yield 'Error: Request timeout';
    } else {
      console.error('[chat] Error:', error);
      yield 'Error: Connection failed';
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: Message[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages' },
        { status: 400 }
      );
    }

    // Get latest user message (for future use with web search)
    // Keeping for potential enhancement: const latestUserMessage = messages...

    // OPTIMIZATION: Skip web search for free tier to avoid timeouts
    // Only use cached portfolio context
    const systemPrompt = await buildSystemPrompt();

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamGeminiResponse(messages, systemPrompt)) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[chat] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
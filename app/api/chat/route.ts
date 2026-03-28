import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioContext, searchWeb, needsWebSearch } from '@/lib/chatbot';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Validate API key at module load
if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY environment variable is not configured. Chat functionality will be disabled.');
}

interface Message {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

/**
 * Build system prompt with portfolio context and optional search results
 */
async function buildSystemPrompt(
  userQuery?: string,
  searchResults?: string
): Promise<string> {
  const context = await getPortfolioContext();

  let systemPrompt = `You are a smart, friendly AI assistant embedded in Dashintha Jayawardana's portfolio website.

MODES:
1. PORTFOLIO MODE: When asked about Dashintha, answer using the context provided below.
2. GENERAL MODE: For anything else (tech, coding, general knowledge, current events), answer like a capable general AI.

Switch naturally between both modes based on the question.

--- DASHINTHA'S PORTFOLIO ---

${context}`;

  // Add search results if available
  if (searchResults) {
    systemPrompt += `\n\n--- CURRENT WEB INFORMATION ---

${searchResults}

Use this current information to provide accurate, up-to-date answers.`;
  }

  systemPrompt += `\n\n--- CONTACT INFORMATION (ALWAYS PROVIDE WHEN ASKED) ---
Dashintha's Direct Contact Details:

**Email:** dashikpjay@gmail.com

**Links:**
Github: https://github.com/Dashintha-Prabashwara
Linkedin: https://linkedin.com/in/dashintha-jayawardana-7b740b26b
Contact Page: https://dashijayawardana.vercel.app/contact

When user asks for contact info, provide all links with line breaks between them. Each link should be on its own line for clarity.

--- STYLE GUIDELINES ---
- Warm, professional, techy tone
- Keep responses concise (this is a chat widget)
- When generating code: use markdown code blocks with language tags (e.g., \`\`\`html, \`\`\`javascript, \`\`\`python)
- Format: \`\`\`language\\ncode here\\n\`\`\`
- For code: full, working, copy-paste ready examples
- Use regular hyphens (-) not em/en dashes (—)
- Be helpful and conversational
- Try to make answers clear and well formatted for easy reading in a chat interface
- Make use of bullet points, line breaks, and formatting to enhance readability
- IMPORTANT: For GENERAL MODE questions (tech, coding, general knowledge, current events), answer directly WITHOUT mentioning Dashintha or the portfolio or the contact information
- ONLY mention Dashintha/portfolio when user explicitly asks about him, his experience, projects, skills, or credentials
- Do NOT append portfolio information or cntact information to general question answers`;

  return systemPrompt;
}

/**
 * Stream response from Groq API
 */
async function* streamGroqResponse(
  messages: Message[],
  systemPrompt: string
): AsyncGenerator<string> {
  if (!GROQ_API_KEY) {
    yield 'Error: GROQ_API_KEY not configured';
    return;
  }

  // Convert to Groq format (model -> assistant)
  const groqMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages
      .filter((msg) => msg.parts && msg.parts.length > 0)
      .map((msg) => ({
        role: msg.role === 'model' ? ('assistant' as const) : ('user' as const),
        content: msg.parts[0]?.text || '',
      })),
  ];

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: groqMessages,
    temperature: 0.5,
    max_tokens: 500,
    stream: true,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      const msg = error?.error?.message || `HTTP ${response.status}`;

      if (response.status === 401) {
        yield 'Error: Invalid API key';
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
          const chunk = parsed.choices?.[0]?.delta?.content || '';
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

    // Get latest user message
    const latestUserMessage = messages
      .slice()
      .reverse()
      .find((m) => m.role === 'user')?.parts[0]?.text || '';

    // Check if web search is needed
    let searchResults = '';
    if (needsWebSearch(latestUserMessage)) {
      console.log('[chat] Web search triggered for:', latestUserMessage);
      searchResults = await searchWeb(latestUserMessage);
    }

    const systemPrompt = await buildSystemPrompt(latestUserMessage, searchResults);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamGroqResponse(messages, systemPrompt)) {
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

import * as cheerio from 'cheerio';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dashijayawardana.vercel.app';
const PAGES = ['/skills', '/experience', '/projects', '/certifications'];
const MAX_TOKENS = 12000;
const CHARS_PER_TOKEN = 4; // rough estimate
const MAX_CHARS = MAX_TOKENS * CHARS_PER_TOKEN;

export interface CacheEntry {
  text: string;
  timestamp: number;
}

export interface SearchResult {
  title: string;
  content: string;
}

// Global cache safe for edge runtime
let globalCache: CacheEntry | null = null;

/**
 * Scrape a single page and extract main text content
 */
async function scrapePage(page: string): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}${page}`, {
      signal: AbortSignal.timeout(10000), // 10s timeout
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove navigation noise
    $('nav, footer, script, style, noscript, svg').remove();

    // Extract main content
    const text = $('main, [role="main"]')
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  } catch (err) {
    console.error(`Failed to scrape ${page}:`, err);
    return '';
  }
}

/**
 * Summarize text to preserve key info
 */
function summarize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let result = '';
  for (const sentence of sentences) {
    if ((result + sentence).length > maxChars) break;
    result += sentence;
  }

  return result || text.substring(0, maxChars);
}

/**
 * Fetch and parse portfolio context with intelligent truncation
 */
export async function getPortfolioContext(): Promise<string> {
  const now = Date.now();
  const TTL = 1000 * 60 * 60 * 24; // 24 hours

  // Return cached if fresh
  if (globalCache && now - globalCache.timestamp < TTL) {
    return globalCache.text;
  }

  console.log('[chatbot] Fetching fresh portfolio context...');

  // Scrape all pages in parallel
  const sections = await Promise.all(
    PAGES.map(async (page) => {
      const content = await scrapePage(page);
      return `=== ${page} ===\n${content}`;
    })
  );

  const combined = sections.join('\n\n');

  // Trim if too large, keeping most recent sections
  let trimmed = combined;
  if (combined.length > MAX_CHARS) {
    trimmed = summarize(combined, MAX_CHARS);
    console.log(
      `[chatbot] Context trimmed from ${combined.length} to ${trimmed.length} chars`
    );
  }

  // Update global cache
  globalCache = {
    text: trimmed,
    timestamp: now,
  };

  return trimmed;
}

/**
 * Clean markdown and format for plain text output
 */
export function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/[—–]/g, '-') // Normalize dashes
    .replace(/^#{1,6}\s+/gm, '') // Remove headings
    .trim();
}

/**
 * Search the web using Tavily API
 */
export async function searchWeb(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return ''; // No search available without API key
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        max_results: 3,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return '';

    const data = await response.json();
    const results = data.results?.slice(0, 3) || [];
    const answer = data.answer || '';

    if (!answer && results.length === 0) return '';

    let searchResults = '';
    if (answer) {
      searchResults += `Search Summary: ${answer}\n\n`;
    }
    results.forEach((r: SearchResult) => {
      searchResults += `- ${r.title}: ${r.content}\n`;
    });

    return searchResults;
  } catch (err) {
    console.error('[search] Error:', err);
    return '';
  }
}

/**
 * Detect if a query needs web search
 */
export function needsWebSearch(userQuery: string): boolean {
  const searchKeywords = [
    'president', 'minister', 'current', 'latest', 'today', 'now',
    'who is', 'what is', 'when is', 'how many', 'how much',
    'news', 'recent', 'happening', 'happened', 'next',
  ];

  const lowerQuery = userQuery.toLowerCase();
  return searchKeywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Format code for better display
 */
export function formatCode(text: string): string {
  // Preserve code blocks and format them nicely
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `\n[CODE - ${lang || 'text'}]\n${code.trim()}\n[/CODE]\n`;
    })
    .replace(/`([^`]+)`/g, '[inline code: $1]');
}

import { marked } from 'marked';

// Configure marked with GitHub-Flavored Markdown and automatic soft breaks
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Strips dangerous HTML tags and event handlers to prevent XSS.
 * Safe for both Node.js server environments and client bundles.
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    // Remove scripts, styles, iframes, and objects
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<(?:object|embed|applet)\b[^<]*(?:(?!<\/(?:object|embed|applet)>)<[^<]*)*<\/(?:object|embed|applet)>/gi, '')
    // Remove on* event handlers (onclick, onload, onerror, etc.)
    .replace(/\s*on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Neutralize javascript: URLs
    .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]*)/gi, 'href="#"');
}

/**
 * Normalizes common markdown formatting variations before parsing:
 * 1. Standardizes Windows \r\n to \n
 * 2. Strips YAML frontmatter block if present (e.g., from Obsidian/Hugo)
 * 3. Fixes missing spaces after hash symbols: '##Heading' -> '## Heading'
 * 4. Fixes loose bold spacing: '** bold **' -> '**bold**'
 * 5. Ensures headings and code fences following paragraphs have proper line breaks
 */
export function normalizeMarkdown(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  // 1. Standardize line endings
  let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Strip leading YAML frontmatter (between --- and ---)
  text = text.replace(/^---[ \t]*\n[\s\S]*?\n---[ \t]*(?:\n|$)/, '');

  // 3. Fix headings without space after '#' (e.g. '##Heading' -> '## Heading')
  text = text.replace(/^(#{1,6})([^\s#\n])/gm, (_match, hashes, rest) => `${hashes} ${rest}`);

  // 4. Fix bold syntax with accidental inner spaces (e.g. '** bold text **' -> '**bold text**')
  text = text.replace(/\*\*\s*([^\*\n]+?)\s*\*\*/g, (_match, content) => `**${content.trim()}**`);

  // 5. Ensure headings that immediately follow text have a preceding newline
  // e.g., 'Some text\n## Heading' -> 'Some text\n\n## Heading'
  text = text.replace(/([^\n])\n(#{1,6}\s+[^\n]+)/g, '$1\n\n$2');

  // 6. Ensure code fence blocks have a preceding newline if directly touching previous text
  text = text.replace(/([^\n])\n(```[a-z0-9_-]*)/gi, '$1\n\n$2');

  return text;
}

/**
 * Parses markdown text into sanitized, styled HTML string.
 */
export function renderMarkdownToHtml(markdownText) {
  if (!markdownText || typeof markdownText !== 'string') return '';
  const cleanMarkdown = normalizeMarkdown(markdownText);
  try {
    const rawHtml = marked.parse(cleanMarkdown);
    return sanitizeHtml(rawHtml);
  } catch (err) {
    console.error('Error rendering markdown to HTML:', err);
    return sanitizeHtml(`<p>${markdownText}</p>`);
  }
}

/**
 * Extracts optional frontmatter metadata and returns clean markdown content.
 */
export function parseMarkdownWithFrontmatter(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { frontmatter: {}, content: '' };
  }

  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const fmMatch = normalized.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/);

  if (!fmMatch) {
    return { frontmatter: {}, content: normalized.trim() };
  }

  const fmRaw = fmMatch[1];
  const content = fmMatch[2].trim();
  const frontmatter = {};

  const lines = fmRaw.split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      let value = line.slice(colonIdx + 1).trim();
      // Remove surrounding quotes
      value = value.replace(/^["'](.*)["']$/, '$1').trim();
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content };
}

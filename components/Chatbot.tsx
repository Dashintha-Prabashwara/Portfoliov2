'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: 'skills', text: 'What are your skills?' },
  { label: 'projects', text: 'Tell me about your projects' },
  { label: 'experience', text: 'What is your experience?' },
  { label: 'contact', text: 'How can I contact you?' },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load messages from sessionStorage on mount
  useEffect(() => {
    try {
      const savedMessages = sessionStorage.getItem('chatbot_messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      try {
        sessionStorage.setItem('chatbot_messages', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }
  }, [messages, isHydrated]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Welcome message - only show when chat opens
  useEffect(() => {
    if (isOpen && isHydrated && messages.length === 0) {
      setMessages([{
        role: 'bot',
        text: "Hey! I'm Dashintha's assistant, powered by your live portfolio data. Ask me about his skills, projects, experience - or anything else!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [isOpen, isHydrated]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px';
    }
  }, [input]);

  const getTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageContent = (text: string): (string | JSX.Element)[] => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let codeIndex = 0;

    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const lang = match[1] || 'text';
      const code = match[2].trim();

      parts.push(
        <div key={`code-${codeIndex++}`} className="bg-slate-800 rounded p-2 my-1 text-xs overflow-x-auto font-mono border border-slate-700 mt-2 mb-2">
          <div className="text-cyan-400 text-xs mb-1 font-semibold">{lang.toUpperCase()}</div>
          <pre className="whitespace-pre-wrap break-words text-slate-100">{code}</pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: text.trim(),
      timestamp: getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', parts: [{ text }] }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullText = '';

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: '',
          timestamp: getTime(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'bot') {
            updated[lastIdx].text = fullText;
          }
          return updated;
        });
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error
          ? `Error: ${error.message}`
          : 'Connection failed. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: errorMsg,
          timestamp: getTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (text: string) => {
    if (!isLoading) {
      sendMessage(text);
    }
  };

  return (
    <>
      <style jsx>{`
      :root {
        --bg: #0d0f14;
        --surface: #13161e;
        --surface2: #1a1e28;
        --border: rgba(255, 255, 255, 0.07);
        --border-active: rgba(99, 188, 130, 0.4);
        --accent: #63bc82;
        --accent-dim: rgba(99, 188, 130, 0.12);
        --text: #e8eaf0;
        --text-muted: #454a57;
        --user-bubble: #1e2a22;
        --user-border: rgba(99, 188, 130, 0.25);
        --bot-bubble: #161920;
        --bot-border: rgba(255, 255, 255, 0.06);
      }

      .chat-backdrop {
        position: fixed;
        inset: 0;
        z-index: 39;
        background: rgba(0, 0, 0, 0);
        backdrop-filter: blur(0px);
        animation: backdropIn 0.2s ease forwards;
      }

      @keyframes backdropIn {
        from {
          backdrop-filter: blur(0px);
        }
        to {
          backdrop-filter: blur(2px);
        }
      }

      @keyframes popIn {
        from {
          opacity: 0;
          transform: scale(0.85) translateY(12px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(99, 188, 130, 0.4);
        }
        50% {
          box-shadow: 0 0 0 4px rgba(99, 188, 130, 0);
        }
      }

      @keyframes msgIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes typingBounce {
        0%,
        80%,
        100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        40% {
          transform: translateY(-4px);
          opacity: 1;
        }
      }

      .chat-button {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 40;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #a4e6ff 0%, #d8b9ff 100%);
        border: 1px solid rgba(164, 230, 255, 0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(164, 230, 255, 0.2);
        transition: transform 0.2s, box-shadow 0.2s;
        backdrop-filter: blur(10px);
      }

      .chat-button.closing {
        animation: none;
      }

      .chat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(99, 188, 130, 0.4);
      }

      .chat-button:active {
        transform: scale(0.95);
      }

      .chat-button svg {
        width: 24px;
        height: 24px;
        color: #131313;
      }

      .chat-container {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 41;
        width: 370px;
        height: 560px;
        background: rgba(19, 22, 30, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(164, 230, 255, 0.4);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(164, 230, 255, 0.2);
        animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        font-family: 'DM Sans', sans-serif;
      }

      .chat-header {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        background: var(--surface);
        flex-shrink: 0;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
      }

      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--accent-dim);
        border: 1px solid var(--border-active);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
      }

      .avatar svg {
        width: 18px;
        height: 18px;
        color: var(--accent);
      }

      .status-dot {
        width: 8px;
        height: 8px;
        background: var(--accent);
        border-radius: 50%;
        position: absolute;
        bottom: 0;
        right: 0;
        border: 2px solid var(--surface);
        animation: pulse 2s infinite;
      }

      .header-info {
        flex: 1;
        min-width: 0;
      }

      .header-name {
        font-size: 13.5px;
        font-weight: 500;
        color: var(--text);
      }

      .header-sub {
        font-size: 11px;
        color: var(--accent);
        font-family: 'JetBrains Mono', monospace;
      }

      .header-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: var(--accent);
        background: var(--accent-dim);
        border: 1px solid var(--border-active);
        border-radius: 4px;
        padding: 2px 6px;
      }

      .close-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .close-btn:hover {
        color: var(--text);
      }

      .close-btn svg {
        width: 20px;
        height: 20px;
      }

      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        scroll-behavior: smooth;
      }

      .messages::-webkit-scrollbar {
        width: 3px;
      }

      .messages::-webkit-scrollbar-thumb {
        background: var(--text-muted);
        border-radius: 2px;
      }

      .msg {
        display: flex;
        flex-direction: column;
        max-width: 88%;
        animation: msgIn 0.2s ease forwards;
      }

      .msg.user {
        align-self: flex-end;
        align-items: flex-end;
      }

      .msg.bot {
        align-self: flex-start;
        align-items: flex-start;
      }

      .bubble {
        padding: 9px 13px;
        border-radius: 13px;
        font-size: 13.5px;
        line-height: 1.6;
        word-break: break-word;
      }

      .msg.user .bubble {
        background: linear-gradient(135deg, rgba(164, 230, 255, 0.15) 0%, rgba(216, 185, 255, 0.1) 100%);
        border: 1px solid rgba(164, 230, 255, 0.3);
        color: var(--text);
        border-bottom-right-radius: 4px;
        box-shadow: 0 2px 8px rgba(164, 230, 255, 0.1);
      }

      .msg.bot .bubble {
        background: linear-gradient(135deg, rgba(19, 22, 30, 0.8) 0%, rgba(26, 30, 40, 0.6) 100%);
        border: 1px solid rgba(164, 230, 255, 0.2);
        color: var(--text);
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .msg-time {
        font-size: 10px;
        color: var(--text-muted);
        font-family: 'JetBrains Mono', monospace;
        margin-top: 3px;
        padding: 0 4px;
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 13px;
        background: linear-gradient(135deg, rgba(19, 22, 30, 0.8) 0%, rgba(26, 30, 40, 0.6) 100%);
        border: 1px solid rgba(164, 230, 255, 0.2);
        border-radius: 13px;
        border-bottom-left-radius: 4px;
        width: fit-content;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .typing-dot {
        width: 6px;
        height: 6px;
        background: #a4e6ff;
        border-radius: 50%;
        animation: typingBounce 1.2s infinite ease-in-out;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 8px 12px 6px;
        flex-shrink: 0;
        border-top: 1px solid var(--border);
      }

      .chip {
        font-size: 11.5px;
        font-family: 'JetBrains Mono', monospace;
        color: var(--accent);
        background: var(--accent-dim);
        border: 1px solid var(--border-active);
        border-radius: 6px;
        padding: 4px 9px;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
        white-space: nowrap;
      }

      .chip:hover {
        background: rgba(99, 188, 130, 0.2);
        border-color: rgba(99, 188, 130, 0.5);
      }

      .chip:disabled,
      .chip.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .input-row {
        padding: 8px 12px 14px;
        display: flex;
        gap: 8px;
        align-items: flex-end;
        flex-shrink: 0;
      }

      .input-wrap {
        flex: 1;
        background: var(--surface2);
        border: 1px solid var(--border);
        border-radius: 10px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        transition: border-color 0.2s;
      }

      .input-wrap:focus-within {
        border-color: var(--border-active);
      }

      textarea {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text);
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        resize: none;
        padding: 9px 0;
        line-height: 1.4;
        max-height: 80px;
        overflow-y: auto;
      }

      textarea::placeholder {
        color: var(--text-muted);
      }

      .send-btn {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: var(--accent);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: opacity 0.15s, transform 0.1s;
      }

      .send-btn:hover {
        opacity: 0.85;
      }

      .send-btn:active {
        transform: scale(0.93);
      }

      .send-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .send-btn svg {
        width: 16px;
        height: 16px;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .chat-button {
          bottom: 16px;
          right: 16px;
          width: 48px;
          height: 48px;
        }

        .chat-button svg {
          width: 20px;
          height: 20px;
        }

        .chat-container {
          width: calc(100vw - 24px);
          height: calc(100dvh - 120px);
          bottom: 60px;
          right: 12px;
          left: 12px;
          max-width: none;
          border-radius: 16px;
        }

        .chat-header {
          padding: 12px 14px;
          gap: 8px;
        }

        .avatar {
          width: 28px;
          height: 28px;
        }

        .avatar svg {
          width: 14px;
          height: 14px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
        }

        .header-name {
          font-size: 12px;
          font-weight: 500;
        }

        .header-sub {
          font-size: 10px;
        }

        .header-badge {
          font-size: 9px;
          padding: 2px 5px;
        }

        .close-btn {
          padding: 2px;
        }

        .close-btn svg {
          width: 18px;
          height: 18px;
        }

        .messages {
          padding: 10px 10px;
          gap: 8px;
        }

        .msg {
          max-width: 90%;
        }

        .bubble {
          font-size: 13px;
          padding: 8px 12px;
          line-height: 1.4;
        }

        .msg-time {
          font-size: 10px;
          margin-top: 2px;
        }

        .typing-indicator {
          padding: 9px 12px;
          border-radius: 12px;
        }

        .typing-dot {
          width: 5px;
          height: 5px;
        }

        .chips {
          padding: 8px 10px 6px;
          gap: 5px;
          flex-wrap: wrap;
        }

        .chip {
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 5px;
        }

        .input-row {
          padding: 8px 10px 12px;
          gap: 6px;
        }

        .input-wrap {
          padding: 0 10px;
          border-radius: 10px;
        }

        textarea {
          font-size: 13px;
          padding: 8px 0;
          line-height: 1.3;
          max-height: 70px;
        }

        .send-btn {
          width: 32px;
          height: 32px;
        }

        .send-btn svg {
          width: 15px;
          height: 15px;
        }
      }

      @media (max-width: 480px) {
        .chat-button {
          bottom: 12px;
          right: 12px;
          width: 44px;
          height: 44px;
        }

        .chat-button svg {
          width: 18px;
          height: 18px;
        }

        .chat-container {
          width: calc(100vw - 16px);
          height: calc(100dvh - 100px);
          bottom: 50px;
          right: 8px;
          left: 8px;
          border-radius: 14px;
        }

        .chat-header {
          padding: 10px 12px;
          gap: 6px;
        }

        .avatar {
          width: 26px;
          height: 26px;
        }

        .avatar svg {
          width: 12px;
          height: 12px;
        }

        .header-name {
          font-size: 11px;
        }

        .header-sub {
          font-size: 9px;
        }

        .header-badge {
          font-size: 8px;
          padding: 1px 4px;
        }

        .messages {
          padding: 8px 8px;
          gap: 6px;
        }

        .msg {
          max-width: 88%;
        }

        .bubble {
          font-size: 12px;
          padding: 6px 10px;
        }

        .typing-indicator {
          padding: 8px 10px;
          border-radius: 11px;
        }

        .chip {
          font-size: 9px;
          padding: 3px 6px;
          border-radius: 4px;
        }

        .chips {
          padding: 6px 8px 4px;
          gap: 4px;
        }

        .input-row {
          padding: 6px 8px 10px;
          gap: 5px;
        }

        textarea {
          font-size: 12px;
          padding: 7px 0;
          max-height: 60px;
        }

        .send-btn {
          width: 28px;
          height: 28px;
        }

        .send-btn svg {
          width: 12px;
          height: 12px;
        }
      }

      @media (max-width: 360px) {
        .chat-container {
          width: calc(100vw - 12px);
          height: calc(100dvh - 80px);
          bottom: 40px;
          right: 6px;
          left: 6px;
          border-radius: 12px;
        }

        .chat-button {
          bottom: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
        }

        .chat-button svg {
          width: 16px;
          height: 16px;
        }

        .header-name {
          font-size: 10px;
        }

        .bubble {
          font-size: 11px;
          padding: 5px 8px;
        }

        .chip {
          font-size: 8px;
          padding: 2px 5px;
        }
      }
    `}
    </style>

    {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-button"
          title="Open chat"
          aria-label="Open chatbot"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          <div className="chat-backdrop" onClick={() => setIsOpen(false)} />
          <div className="chat-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="chat-header">
            <div className="header-left">
              <div className="avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <div className="status-dot"></div>
              </div>
              <div className="header-info">
                <div className="header-name">Dashintha's Assistant</div>
                <div className="header-sub">{'// online - ready'}</div>
              </div>
            </div>
            <div className="header-badge">AI</div>
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn"
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.role}`}>
                <div className="bubble">
                  {msg.role === 'bot' ? formatMessageContent(msg.text) : msg.text}
                </div>
                <div className="msg-time">{msg.timestamp}</div>
              </div>
            ))}
            {isLoading && (
              <div className="msg bot">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="chips">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => handleChip(prompt.text)}
                disabled={isLoading}
                className="chip"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="input-row">
            <div className="input-wrap">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                rows={1}
                maxLength={500}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="send-btn"
              title="Send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
        </>
      )}
    </>
  );
}

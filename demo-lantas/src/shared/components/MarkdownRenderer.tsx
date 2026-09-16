import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isBot?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isBot = true }) => {
  if (!content) return null;

  // Split by line breaks
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    const items = currentList.items;
    const isOrdered = currentList.type === 'ol';
    
    renderedElements.push(
      isOrdered ? (
        <ol key={`ol-${renderedElements.length}`} className="list-decimal list-outside ml-4 space-y-1 my-1.5 text-xs">
          {items.map((it, idx) => (
            <li key={idx} className="pl-0.5 leading-relaxed">
              {renderFormattedInline(it, isBot)}
            </li>
          ))}
        </ol>
      ) : (
        <ul key={`ul-${renderedElements.length}`} className="list-disc list-outside ml-4 space-y-1 my-1.5 text-xs">
          {items.map((it, idx) => (
            <li key={idx} className="pl-0.5 leading-relaxed">
              {renderFormattedInline(it, isBot)}
            </li>
          ))}
        </ul>
      )
    );
    currentList = null;
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      renderedElements.push(<div key={`sp-${lineIndex}`} className="h-1.5" />);
      return;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      renderedElements.push(
        <hr key={`hr-${lineIndex}`} className={`my-2 border-t ${isBot ? 'border-slate-200' : 'border-white/20'}`} />
      );
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      renderedElements.push(
        <h4 key={`h4-${lineIndex}`} className={`font-extrabold text-[12.5px] mt-2 mb-1 tracking-apple-tight ${isBot ? 'text-[#0F172A]' : 'text-white'}`}>
          {renderFormattedInline(trimmed.replace(/^###\s+/, ''), isBot)}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      renderedElements.push(
        <h3 key={`h3-${lineIndex}`} className={`font-extrabold text-[13px] mt-2.5 mb-1 tracking-apple-tight ${isBot ? 'text-[#0F172A]' : 'text-white'}`}>
          {renderFormattedInline(trimmed.replace(/^##\s+/, ''), isBot)}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      renderedElements.push(
        <h2 key={`h2-${lineIndex}`} className={`font-extrabold text-[13.5px] mt-2.5 mb-1.5 tracking-apple-tight ${isBot ? 'text-[#0077c0]' : 'text-white'}`}>
          {renderFormattedInline(trimmed.replace(/^#\s+/, ''), isBot)}
        </h2>
      );
      return;
    }

    // Unordered list item (* or -)
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      return;
    }

    // Ordered list item (1. 2. etc)
    const olMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[2]);
      return;
    }

    // Regular paragraph
    flushList();
    renderedElements.push(
      <p key={`p-${lineIndex}`} className="leading-relaxed my-0.5">
        {renderFormattedInline(trimmed, isBot)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-0.5 text-xs break-words">{renderedElements}</div>;
};

/**
 * Parses bold (**text**), italic (*text*), and inline code (`code`)
 */
function renderFormattedInline(text: string, isBot: boolean): React.ReactNode[] {
  // Regex splitting by bold, inline code, and italic
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className={`font-extrabold ${isBot ? 'text-[#0F172A]' : 'text-white'}`}>
          {inner}
        </strong>
      );
    }

    // Inline Code: `text`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={i}
          className={`px-1.5 py-0.5 rounded font-mono text-[10.5px] font-semibold ${
            isBot ? 'bg-slate-100 text-[#0077c0] border border-slate-200' : 'bg-white/20 text-white'
          }`}
        >
          {inner}
        </code>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={i} className="italic opacity-90">
          {inner}
        </em>
      );
    }

    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

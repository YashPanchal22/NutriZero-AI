import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split into lines for basic clean structural rendering
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let listItems: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2.5 pl-6 list-decimal space-y-1.5 text-slate-200">
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2.5 pl-6 list-disc space-y-1.5 text-slate-200">
            {listItems}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const headers = tableRows[0];
      const dataRows = tableRows.slice(1).filter(r => !r.every(c => c.match(/^[-:]+$/)));
      elements.push(
        <div key={`tbl-wrap-${elements.length}`} className="my-3 overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-900/90 text-emerald-400 font-semibold border-b border-slate-800">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 border-r border-slate-800/50 last:border-none">{formatInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-slate-950/40 text-slate-300">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 border-r border-slate-800/30 last:border-none">{formatInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const formatInline = (text: string): React.ReactNode => {
    if (!text) return '';
    // Format bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-emerald-300">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trimEnd();

    // Markdown Table check
    if (line.includes('|') && line.trim().startsWith('|')) {
      flushList();
      inTable = true;
      const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      if (cells.length > 0) {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Markdown Headers (###, ##, #)
    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={idx} className="text-base font-semibold text-emerald-400 mt-4 mb-1.5 flex items-center gap-1.5">{formatInline(line.slice(4))}</h3>);
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={idx} className="text-lg font-bold text-emerald-400 mt-5 mb-2 border-b border-slate-800/60 pb-1">{formatInline(line.slice(3))}</h2>);
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={idx} className="text-xl font-extrabold text-emerald-300 mt-5 mb-2">{formatInline(line.slice(2))}</h1>);
      continue;
    }

    // Ordered lists (1. , 2. )
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      listItems.push(
        <li key={idx} className="pl-1">
          {formatInline(olMatch[2])}
        </li>
      );
      continue;
    }

    // Unordered lists (- , * , • )
    const ulMatch = line.match(/^[-*•]\s+(.*)/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      listItems.push(
        <li key={idx} className="pl-1">
          {formatInline(ulMatch[1])}
        </li>
      );
      continue;
    }

    // Plain text line
    flushList();
    if (line.trim() === '') {
      elements.push(<div key={idx} className="h-2" />);
    } else {
      elements.push(
        <p key={idx} className="my-1.5 leading-relaxed text-slate-200">
          {formatInline(line)}
        </p>
      );
    }
  }

  flushList();
  flushTable();

  return <div className="prose-nutri text-[15px]">{elements}</div>;
};

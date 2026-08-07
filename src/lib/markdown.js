/**
 * Minimal Markdown renderer for the bundled study material.
 *
 * The knowledge base is our own content, compiled into the bundle at build time
 * — it is never user-supplied. Even so, every character is HTML-escaped before
 * any markup is generated, so a stray `<script>` in a .md file renders as text
 * rather than executing.
 *
 * Supports: headings, bold/italic, inline + fenced code, ordered/unordered
 * lists, tables, blockquotes, horizontal rules, links and paragraphs.
 */

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Inline formatting, applied to already-escaped text. */
function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderTable(rows) {
  const cells = (line) =>
    line
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim());

  const [head, , ...body] = rows;
  const headHtml = cells(head).map((c) => `<th>${inline(c)}</th>`).join('');
  const bodyHtml = body
    .map((row) => `<tr>${cells(row).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
    .join('');

  return `<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

export function renderMarkdown(source) {
  const lines = escapeHtml(source ?? '').split('\n');
  const out = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^\s*```/.test(line)) {
      const buffer = [];
      i += 1;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      out.push(`<pre><code>${buffer.join('\n')}</code></pre>`);
      continue;
    }

    // Table (header row followed by a separator row)
    if (line.includes('|') && /^\s*\|?[\s:-]*-[\s|:-]*\|/.test(lines[i + 1] ?? '')) {
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i]);
        i += 1;
      }
      out.push(renderTable(rows));
      continue;
    }

    // Horizontal rule
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      out.push('<hr />');
      i += 1;
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      out.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    // Blockquote
    if (/^\s*&gt;\s?/.test(line)) {
      const buffer = [];
      while (i < lines.length && /^\s*&gt;\s?/.test(lines[i])) {
        buffer.push(lines[i].replace(/^\s*&gt;\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote>${inline(buffer.join(' '))}</blockquote>`);
      continue;
    }

    // Lists
    const isUnordered = (l) => /^\s*[-*+]\s+/.test(l);
    const isOrdered = (l) => /^\s*\d+[.)]\s+/.test(l);

    if (isUnordered(line) || isOrdered(line)) {
      const ordered = isOrdered(line);
      const matches = ordered ? isOrdered : isUnordered;
      const items = [];

      while (i < lines.length && matches(lines[i])) {
        const text = lines[i].replace(ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/, '');
        items.push(`<li>${inline(text)}</li>`);
        i += 1;
      }

      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Paragraph — consume until a blank line or a block-level construct.
    const paragraph = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|\s*```|\s*&gt;\s?|\s*[-*+]\s|\s*\d+[.)]\s)/.test(lines[i]) &&
      !/^\s*(---|\*\*\*|___)\s*$/.test(lines[i])
    ) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    if (paragraph.length) out.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }

  return out.join('\n');
}

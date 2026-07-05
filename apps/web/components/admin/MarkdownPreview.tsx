'use client';

export function MarkdownPreview({ content }: { content: string }) {
  const html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  return (
    <div
      style={{ marginTop: 12, padding: 16, borderRadius: 8, border: '1px solid var(--color-border)', lineHeight: 1.6, fontSize: 15 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

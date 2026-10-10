export interface Chunk {
  text: string;
  start: number;
  end: number;
}

/** Paragraph-aligned chunks of ~maxLen chars with offsets into the original string. */
export function chunkText(text: string, maxLen = 6000): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxLen, text.length);
    if (end < text.length) {
      const nl = text.lastIndexOf('\n', end);
      if (nl > start + maxLen / 2) end = nl;
    }
    chunks.push({ text: text.slice(start, end), start, end });
    start = end;
  }
  return chunks;
}

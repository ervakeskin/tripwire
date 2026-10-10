import type { Report } from './schema';

export interface PageText {
  url: string;
  title: string;
  text: string;
  hiddenFlags: string[]; // injection flags found in HIDDEN text (never sent to LLM)
  hiddenChars: number;
  looksLikeLegal: boolean;
}

export type Msg =
  | { type: 'EXTRACT' } // sidepanel -> content
  | { type: 'ANALYZE'; page: PageText } // sidepanel -> background
  | { type: 'HIGHLIGHT'; quote: string } // sidepanel -> content
  | { type: 'PROGRESS'; done: number; total: number }; // background -> sidepanel

export type AnalyzeResponse = { ok: true; report: Report } | { ok: false; error: string };

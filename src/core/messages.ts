import type { Report } from './schema';
import type { LinkInfo } from './legal';

export interface PageText {
  url: string;
  title: string;
  text: string;
  hiddenFlags: string[]; // injection flags found in HIDDEN text (never sent to LLM)
  hiddenChars: number;
  looksLikeLegal: boolean;
  /** which reading layer produced `text`: page-agent's PageController, or our own visible-text extractor (fallback) */
  textSource: 'page-agent' | 'fallback';
  agentChars: number;
  ownChars: number;
}

export type Msg =
  | { type: 'EXTRACT' } // sidepanel -> content
  | { type: 'FIND_LINKS' } // sidepanel -> content: links to legal documents on this page
  | { type: 'ANALYZE'; page: PageText } // sidepanel -> background
  | { type: 'HIGHLIGHT'; quote: string } // sidepanel -> content
  | { type: 'PROGRESS'; done: number; total: number }; // background -> sidepanel

export type AnalyzeResponse = { ok: true; report: Report } | { ok: false; error: string };

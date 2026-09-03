/**
 * Shared types for Alignment Sentinel MCP.
 */

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  updated: string;
  categories: string[];
  pdfUrl: string;
  absUrl: string;
}

export interface PaperBreakdown {
  id: string;
  title: string;
  authors: string[];
  published: string;
  categories: string[];
  summary: string;
  coreHypothesis: string;
  methodology: string;
  threatModel: string;
  limitations: string;
  safetyRelevance: string;
  pdfUrl: string;
}

export interface BenchmarkEntry {
  name: string;
  fullName: string;
  domain: string;
  description: string;
  keyMetrics: string[];
  paperRef: string;
  arxivId: string;
  year: number;
  tasks: string[];
  notableFindings: string[];
}

export interface TaxonomyEntry {
  concept: string;
  category: string;
  definition: string;
  keyPapers: string[];
  relatedConcepts: string[];
  anthropicRelevance: string;
}

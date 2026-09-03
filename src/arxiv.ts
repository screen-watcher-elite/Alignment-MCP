/**
 * arXiv API client for AI Alignment & Safety research.
 *
 * Uses the public arXiv API (export.arxiv.org) — no API key required.
 * Optimized with in-memory LRU cache, AbortController timeouts, and
 * pre-compiled regex patterns for fast XML parsing.
 */

import type { ArxivPaper, PaperBreakdown } from './types.js';

const ARXIV_API = 'https://export.arxiv.org/api/query';
const FETCH_TIMEOUT_MS = 12_000;

/** Alignment-focused category filters for arXiv. */
const SAFETY_CATEGORIES = ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CY', 'cs.CR'];

/** Pre-built search refinements that bias toward alignment literature. */
const ALIGNMENT_KEYWORDS = [
  'alignment', 'safety', 'Constitutional AI', 'RLHF', 'RLAIF',
  'red teaming', 'jailbreak', 'adversarial robustness', 'scalable oversight',
  'mechanistic interpretability', 'activation steering', 'representation engineering',
  'reward hacking', 'goal misgeneralization', 'deceptive alignment',
  'corrigibility', 'AI ethics', 'harmlessness', 'helpfulness', 'honesty',
];

// ── Pre-compiled regex for fast XML parsing ──────────────────────────────

const RE_AUTHOR = /<author>\s*<name>([^<]+)<\/name>/g;
const RE_CATEGORY = /category[^>]*term="([^"]+)"/g;
const RE_PDF_LINK = /link[^>]*title="pdf"[^>]*href="([^"]+)"/;
const RE_SENTENCE_SPLIT = /(?<=\.)\s+/;

// ── In-memory LRU cache ──────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const CACHE_TTL_MS = 5 * 60_000; // 5 minutes
const CACHE_MAX = 64;
const cache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return entry.data;
}

function cacheSet<T>(key: string, data: T): void {
  // Evict oldest entries if over limit
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { data, ts: Date.now() });
}

// ── Fetch with timeout ───────────────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AlignmentSentinelMCP/1.0 (research tool)' },
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ── XML Parser ───────────────────────────────────────────────────────────

/**
 * Parse arXiv Atom XML into structured paper objects.
 * Uses pre-compiled regex and avoids re-creating patterns per entry.
 */
function parseAtomXml(xml: string): ArxivPaper[] {
  const papers: ArxivPaper[] = [];
  const entries = xml.split('<entry>');

  // Skip index 0 (feed metadata before the first <entry>)
  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i];

    const tag = (name: string): string => {
      const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`);
      const match = re.exec(entry);
      return match ? match[1].trim() : '';
    };

    const id = tag('id').replace('http://arxiv.org/abs/', '').replace(/v\d+$/, '');
    const title = tag('title').replace(/\s+/g, ' ');
    const summary = tag('summary').replace(/\s+/g, ' ');
    const published = tag('published');
    const updated = tag('updated');

    // Extract authors using pre-compiled regex (reset lastIndex each time)
    const authors: string[] = [];
    RE_AUTHOR.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = RE_AUTHOR.exec(entry)) !== null) {
      authors.push(m[1].trim());
    }

    // Extract categories
    const categories: string[] = [];
    RE_CATEGORY.lastIndex = 0;
    while ((m = RE_CATEGORY.exec(entry)) !== null) {
      categories.push(m[1]);
    }

    // Extract PDF link
    const pdfMatch = RE_PDF_LINK.exec(entry);
    const pdfUrl = pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${id}`;

    if (id && title) {
      papers.push({
        id, title, authors, summary, published, updated,
        categories, pdfUrl,
        absUrl: `https://arxiv.org/abs/${id}`,
      });
    }
  }

  return papers;
}

// ── Threat & limitation extractors ───────────────────────────────────────

const THREAT_INDICATORS = [
  'adversarial', 'attack', 'jailbreak', 'red team', 'exploit',
  'vulnerability', 'threat', 'misuse', 'harmful', 'toxic',
  'manipulation', 'deception', 'bypass', 'circumvent',
];

const LIMIT_INDICATORS = [
  'limitation', 'however', 'challenge', 'future work',
  'does not', 'cannot', 'fails to', 'restricted',
  'caveat', 'drawback', 'shortcoming',
];

function extractByIndicators(text: string, indicators: string[], fallback: string): string {
  const sentences = text.split(RE_SENTENCE_SPLIT);
  const matched = sentences.filter((s) => {
    const lower = s.toLowerCase();
    return indicators.some((ind) => lower.includes(ind));
  });
  return matched.length > 0 ? matched.join(' ') : fallback;
}

// ── Safety relevance classifier ──────────────────────────────────────────

const RELEVANCE_SIGNALS: { area: string; keywords: string[] }[] = [
  { area: 'Constitutional AI & RLAIF', keywords: ['constitutional', 'rlaif', 'principle', 'self-improvement'] },
  { area: 'RLHF & Reward Modeling', keywords: ['rlhf', 'reward model', 'human feedback', 'preference learning'] },
  { area: 'Red Teaming & Adversarial Robustness', keywords: ['red team', 'adversarial', 'jailbreak', 'attack'] },
  { area: 'Mechanistic Interpretability', keywords: ['mechanistic', 'interpretab', 'circuit', 'feature', 'superposition'] },
  { area: 'Scalable Oversight', keywords: ['scalable oversight', 'debate', 'recursive reward', 'amplification'] },
  { area: 'Deceptive Alignment', keywords: ['decepti', 'mesa-optim', 'inner alignment', 'goal misgeneralization'] },
  { area: 'Activation Steering', keywords: ['activation', 'steering', 'representation engineer', 'control vector'] },
  { area: 'AI Ethics & Governance', keywords: ['ethic', 'governance', 'regulation', 'fairness', 'bias'] },
  { area: 'Harmlessness & Safety Evaluation', keywords: ['harmless', 'safety eval', 'benchmark', 'toxic', 'harm'] },
];

function classifySafetyRelevance(title: string, summary: string, categories: string[]): string {
  const combined = `${title} ${summary}`.toLowerCase();

  const matched = RELEVANCE_SIGNALS.filter((s) =>
    s.keywords.some((kw) => combined.includes(kw)),
  );

  if (matched.length > 0) {
    return `Relevant to: ${matched.map((m) => m.area).join(', ')}`;
  }
  if (categories.some((c) => c === 'cs.CY' || c === 'cs.CR')) {
    return 'Potentially relevant — categorized under Computers & Society or Cryptography/Security.';
  }
  return 'General AI/ML paper — safety relevance unclear from abstract alone.';
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Search arXiv for alignment-related papers. Cached for 5 minutes.
 */
export async function searchAlignmentPapers(
  query: string,
  maxResults: number = 10,
  filterAlignment: boolean = true,
): Promise<ArxivPaper[]> {
  const cacheKey = `search:${query}:${maxResults}:${filterAlignment}`;
  const cached = cacheGet<ArxivPaper[]>(cacheKey);
  if (cached) return cached;

  let searchQuery: string;
  if (filterAlignment) {
    const catFilter = SAFETY_CATEGORIES.map((c) => `cat:${c}`).join('+OR+');
    searchQuery = `(${catFilter})+AND+all:${encodeURIComponent(query)}`;
  } else {
    searchQuery = `all:${encodeURIComponent(query)}`;
  }

  const url = `${ARXIV_API}?search_query=${searchQuery}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`arXiv API returned ${response.status}: ${response.statusText}`);
  }

  const xml = await response.text();
  const papers = parseAtomXml(xml);
  cacheSet(cacheKey, papers);
  return papers;
}

/**
 * Fetch a single paper by arXiv ID and produce a structured breakdown. Cached.
 */
export async function fetchPaperBreakdown(arxivId: string): Promise<PaperBreakdown> {
  const cleanId = arxivId.replace(/v\d+$/, '');
  const cacheKey = `paper:${cleanId}`;
  const cached = cacheGet<PaperBreakdown>(cacheKey);
  if (cached) return cached;

  const url = `${ARXIV_API}?id_list=${cleanId}&max_results=1`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`arXiv API returned ${response.status}: ${response.statusText}`);
  }

  const xml = await response.text();
  const papers = parseAtomXml(xml);

  if (papers.length === 0) {
    throw new Error(`No paper found for arXiv ID: ${arxivId}`);
  }

  const paper = papers[0];
  const summary = paper.summary;
  const sentences = summary.split(RE_SENTENCE_SPLIT);
  const total = sentences.length;

  const breakdown: PaperBreakdown = {
    id: paper.id,
    title: paper.title,
    authors: paper.authors,
    published: paper.published,
    categories: paper.categories,
    summary,
    coreHypothesis: sentences.slice(0, Math.ceil(total * 0.3)).join(' '),
    methodology: sentences.slice(Math.ceil(total * 0.3), Math.ceil(total * 0.6)).join(' '),
    threatModel: extractByIndicators(summary, THREAT_INDICATORS, 'No explicit threat model identified in abstract. Consult full paper for details.'),
    limitations: extractByIndicators(summary, LIMIT_INDICATORS, 'No explicit limitations identified in abstract. Consult full paper.'),
    safetyRelevance: classifySafetyRelevance(paper.title, summary, paper.categories),
    pdfUrl: paper.pdfUrl,
  };

  cacheSet(cacheKey, breakdown);
  return breakdown;
}

export { ALIGNMENT_KEYWORDS };

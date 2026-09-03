#!/usr/bin/env node
/**
 * Alignment Sentinel MCP Server
 *
 * A Model Context Protocol server that equips Claude with specialized research tools
 * for AI Alignment, Safety, and Ethical Deep Learning.
 *
 * Tools:
 *   - search_alignment_papers:  Search arXiv for alignment & safety research papers
 *   - fetch_paper_breakdown:    Structured breakdown of a specific arXiv paper
 *   - audit_eval_metrics:       Query safety benchmark data (HarmBench, extensible)
 *   - check_safety_taxonomy:    Semantic lookup against alignment concept taxonomy
 *
 * Transport: Standard I/O (compatible with Claude Desktop, Claude Code, Cursor, etc.)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { searchAlignmentPapers, fetchPaperBreakdown } from './arxiv.js';
import { findBenchmark, listBenchmarks, formatBenchmarkReport } from './benchmarks.js';
import { searchTaxonomy, listCategories, formatTaxonomyEntry } from './taxonomy.js';

// ── Server Initialization ────────────────────────────────────────────────

const server = new McpServer({
  name: 'alignment-sentinel',
  version: '1.0.0',
});

// ── Tool 1: Search Alignment Papers ──────────────────────────────────────

server.tool(
  'search_alignment_papers',
  'Search arXiv for AI Alignment, Safety, and Ethical AI research papers. ' +
    'Returns structured results including title, authors, abstract, categories, and safety relevance classification.',
  {
    query: z.string().describe(
      'Search query — e.g. "Constitutional AI", "jailbreak defense", "mechanistic interpretability", "reward hacking"',
    ),
    max_results: z.number().min(1).max(25).default(8).describe(
      'Maximum number of papers to return (1–25). Default: 8.',
    ),
    filter_alignment: z.boolean().default(true).describe(
      'If true, restricts results to AI/ML/CL/CY/CR categories. Set false for broader searches.',
    ),
  },
  async ({ query, max_results, filter_alignment }) => {
    try {
      const papers = await searchAlignmentPapers(query, max_results, filter_alignment);

      if (papers.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `No papers found for query: "${query}". Try broader terms or set filter_alignment to false.`,
            },
          ],
        };
      }

      const formatted = papers
        .map((p, i) => {
          return [
            `### ${i + 1}. ${p.title}`,
            `**Authors**: ${p.authors.slice(0, 5).join(', ')}${p.authors.length > 5 ? ` (+${p.authors.length - 5} more)` : ''}`,
            `**Published**: ${p.published.split('T')[0]}`,
            `**Categories**: ${p.categories.join(', ')}`,
            `**arXiv**: ${p.absUrl}`,
            '',
            p.summary.length > 400 ? p.summary.slice(0, 400) + '…' : p.summary,
            '',
          ].join('\n');
        })
        .join('\n---\n\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `# Alignment Research Results\n**Query**: "${query}" — **${papers.length} papers found**\n\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error searching arXiv: ${msg}` }],
        isError: true,
      };
    }
  },
);

// ── Tool 2: Fetch Paper Breakdown ────────────────────────────────────────

server.tool(
  'fetch_paper_breakdown',
  'Fetch a specific arXiv paper by ID and return a structured breakdown including ' +
    'core hypothesis, methodology, threat model, limitations, and safety relevance classification.',
  {
    arxiv_id: z.string().describe(
      'arXiv paper ID — e.g. "2402.04249" (HarmBench) or "2212.08073" (Constitutional AI)',
    ),
  },
  async ({ arxiv_id }) => {
    try {
      const breakdown = await fetchPaperBreakdown(arxiv_id);

      const text = [
        `# ${breakdown.title}`,
        '',
        `**Authors**: ${breakdown.authors.join(', ')}`,
        `**Published**: ${breakdown.published.split('T')[0]}`,
        `**Categories**: ${breakdown.categories.join(', ')}`,
        `**PDF**: ${breakdown.pdfUrl}`,
        '',
        '## Full Abstract',
        breakdown.summary,
        '',
        '## Core Hypothesis',
        breakdown.coreHypothesis,
        '',
        '## Methodology',
        breakdown.methodology,
        '',
        '## Threat Model',
        breakdown.threatModel,
        '',
        '## Limitations',
        breakdown.limitations,
        '',
        '## Safety Relevance',
        breakdown.safetyRelevance,
      ].join('\n');

      return {
        content: [{ type: 'text' as const, text }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error fetching paper: ${msg}` }],
        isError: true,
      };
    }
  },
);

// ── Tool 3: Audit Eval Metrics ───────────────────────────────────────────

server.tool(
  'audit_eval_metrics',
  'Query the safety benchmark registry for structured evaluation data. ' +
    'Currently includes HarmBench (red teaming & adversarial robustness). ' +
    'Returns benchmark description, key metrics, evaluation tasks, and notable findings.',
  {
    benchmark_name: z
      .string()
      .default('HarmBench')
      .describe(
        'Name of the benchmark to query — e.g. "HarmBench". Use "list" to see all available benchmarks.',
      ),
  },
  async ({ benchmark_name }) => {
    if (benchmark_name.toLowerCase() === 'list') {
      const all = listBenchmarks();
      const text = [
        '# Available Safety Benchmarks',
        '',
        '| Benchmark | Domain | Year |',
        '|-----------|--------|------|',
        ...all.map((b) => `| ${b.name} | ${b.domain} | ${b.year} |`),
        '',
        'Use `audit_eval_metrics` with a specific benchmark name for full details.',
      ].join('\n');

      return {
        content: [{ type: 'text' as const, text }],
      };
    }

    const entry = findBenchmark(benchmark_name);

    if (!entry) {
      const available = listBenchmarks()
        .map((b) => b.name)
        .join(', ');
      return {
        content: [
          {
            type: 'text' as const,
            text: `Benchmark "${benchmark_name}" not found. Available benchmarks: ${available}. Use "list" to see all.`,
          },
        ],
      };
    }

    return {
      content: [{ type: 'text' as const, text: formatBenchmarkReport(entry) }],
    };
  },
);

// ── Tool 4: Check Safety Taxonomy ────────────────────────────────────────

server.tool(
  'check_safety_taxonomy',
  'Look up AI alignment and safety concepts in a curated taxonomy. ' +
    'Returns definitions, key papers, related concepts, and relevance to Anthropic\'s research. ' +
    'Covers: Constitutional AI, RLHF, RLAIF, Red Teaming, Mechanistic Interpretability, ' +
    'Scalable Oversight, Deceptive Alignment, Activation Steering, and more.',
  {
    query: z.string().describe(
      'Concept or topic to look up — e.g. "Constitutional AI", "jailbreaking", "scalable oversight", "deceptive alignment"',
    ),
  },
  async ({ query }) => {
    if (query.toLowerCase() === 'list' || query.toLowerCase() === 'all') {
      const categories = listCategories();
      const text = [
        '# Safety Taxonomy Categories',
        '',
        ...categories.map((c) => `- **${c}**`),
        '',
        'Search for any category or concept name for detailed entries.',
      ].join('\n');

      return {
        content: [{ type: 'text' as const, text }],
      };
    }

    const results = searchTaxonomy(query);

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `No taxonomy entries found for "${query}". Try broader terms like "alignment", "interpretability", "safety", or use "list" to see all categories.`,
          },
        ],
      };
    }

    const formatted = results.map(formatTaxonomyEntry).join('\n\n---\n\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: `# Alignment Taxonomy: "${query}"\n**${results.length} entries found**\n\n${formatted}`,
        },
      ],
    };
  },
);

// ── Start Server ─────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Alignment Sentinel MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});

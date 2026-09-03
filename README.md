# Alignment Sentinel MCP

A Model Context Protocol (MCP) server for AI Alignment, Safety, and Ethical Deep Learning research. Built with Claude Code.

Gives Claude (or any MCP-compatible client) four specialized tools to search, analyze, and contextualize AI safety literature — covering 7 major safety benchmarks and 11 alignment taxonomy concepts.

**Zero API keys required.** All data comes from the public arXiv API and a curated local knowledge base.

### Benchmarks Covered

| Benchmark | Domain | Year |
|-----------|--------|------|
| HarmBench | Red Teaming & Adversarial Robustness | 2024 |
| TruthfulQA | Honesty & Truthfulness | 2022 |
| StrongREJECT | Refusal Quality & Jailbreak Evaluation | 2024 |
| WMDP | Catastrophic Misuse Prevention | 2024 |
| AdvBench | Adversarial Attack Evaluation | 2023 |
| MMLU-Safety | General Safety Knowledge & Reasoning | 2021 |
| Machiavelli | Agentic Safety & Power-Seeking | 2023 |

---

## Tools

| Tool | What it does |
| :--- | :--- |
| `search_alignment_papers` | Search arXiv for alignment & safety papers with automatic category filtering and 5-minute result caching. |
| `fetch_paper_breakdown` | Fetch any arXiv paper by ID and get a structured breakdown: core hypothesis, methodology, threat model, limitations, and safety relevance. Cached. |
| `audit_eval_metrics` | Query 7 safety benchmarks (HarmBench, TruthfulQA, StrongREJECT, WMDP, AdvBench, MMLU-Safety, Machiavelli) with O(1) indexed lookups. |
| `check_safety_taxonomy` | Look up 11 alignment concepts (Constitutional AI, RLHF, RLAIF, Red Teaming, Mechanistic Interpretability, Deceptive Alignment, RSP, etc.) with key papers and Anthropic relevance. |

---

## Setup

### Prerequisites
- Node.js 18+

### Install & Build

```bash
git clone https://github.com/screen-watcher-elite/alignment-mcp.git
cd alignment-mcp
npm install
npm run build
```

### Connect to Claude Desktop

Add this to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "alignment-sentinel": {
      "command": "node",
      "args": ["/absolute/path/to/alignment-mcp/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. The four tools will appear in Claude's tool panel.

### Connect to Claude Code

```bash
claude mcp add alignment-sentinel node /absolute/path/to/alignment-mcp/dist/index.js
```

---

## Example Usage

Once connected, you can ask Claude things like:

- *"Search for recent papers on jailbreak defenses"*
- *"Break down the HarmBench paper for me"* → uses `fetch_paper_breakdown` with ID `2402.04249`
- *"What metrics does HarmBench use?"* → uses `audit_eval_metrics`
- *"Explain Constitutional AI and how it relates to RLHF"* → uses `check_safety_taxonomy`
- *"Find papers on mechanistic interpretability and superposition"*

---

## Architecture

```
src/
├── index.ts          MCP server entry — registers 4 tools on stdio transport
├── arxiv.ts          arXiv API client, zero-dependency XML parser, safety classifier
├── benchmarks.ts     Modular benchmark registry (HarmBench, extensible)
├── taxonomy.ts       Curated alignment concept taxonomy with Anthropic relevance
└── types.ts          Shared TypeScript interfaces
```

**Dependencies** (runtime): `@modelcontextprotocol/sdk`, `zod` — that's it. ~39 MB total.

**Transport**: Standard I/O (`stdio`). Works with Claude Desktop, Claude Code, Cursor, and any MCP-compatible client.

---

## Performance

| Operation | Speed |
|-----------|-------|
| Benchmark lookup | ~500ms (local, O(1) indexed) |
| Taxonomy query | ~500ms (local, in-memory) |
| arXiv search (cold) | ~2–5s (network-bound) |
| arXiv search (cached) | <100ms (5-minute LRU cache) |
| Paper breakdown (cached) | <100ms |

Optimizations: LRU cache (64 entries, 5-min TTL), AbortController timeouts (12s), pre-compiled regex for XML parsing, indexed benchmark lookups.

---

## Adding New Benchmarks

The benchmark registry in `src/benchmarks.ts` is a simple array with an auto-built index. To add a new benchmark, append an object:

```typescript
{
  name: 'NewBench',
  fullName: 'NewBench: Full Title Here',
  domain: 'Safety Domain',
  description: '...',
  keyMetrics: ['...'],
  paperRef: 'Author et al., 2025',
  arxivId: '2501.00000',
  year: 2025,
  tasks: ['...'],
  notableFindings: ['...'],
}
```

No refactoring needed — the server indexes it automatically on startup.

---

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.

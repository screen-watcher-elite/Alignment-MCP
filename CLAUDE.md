# Alignment Sentinel MCP — Project Guidelines for Claude Code

## Overview
A Model Context Protocol (MCP) server that empowers Claude with intelligent search, taxonomy auditing, and empirical evaluation extraction for **AI Alignment, Safety, and Ethical Deep Learning** research.

Built using the official `@modelcontextprotocol/sdk` and standard `stdio` transport. Compatible with Claude Desktop, Claude Code, and agentic environments.

## Commands
- Build: `npm run build`
- Watch: `npm run watch`
- Start server: `npm start`
- Dev mode: `npm run dev`

## Architecture & Code Conventions
- **Transport**: Standard I/O (`StdioServerTransport`). All logging MUST go to `console.error` (stderr) so `stdout` remains pure JSON-RPC.
- **Dependencies**: Keep runtime dependencies ultra-minimal (`@modelcontextprotocol/sdk` + `zod`). Use native `fetch` and standard Node.js APIs.
- **Type Safety**: Pure TypeScript with strict mode enabled. Validate all tool input schemas with Zod.
- **Error Handling**: Graceful degradation on API timeouts, XML malformations, or rate limits.

## Primary Tooling
- `search_alignment_papers`: Structured arXiv search with pre-filtered alignment taxonomies.
- `fetch_paper_breakdown`: Key hypothesis, methodology, threat model, and limitations.
- `audit_eval_metrics`: Extraction of safety benchmark scores (HarmBench, TruthfulQA, StrongREJECT, MMLU).
- `check_safety_taxonomy`: Semantic taxonomy reference for alignment frameworks.

# Alignment Sentinel MCP — Project Memory

- **Goal**: Pioneer an open-source MCP server tailored for AI Alignment & Ethical AI literature.
- **Protocol Rules**: Never output debugging information to `stdout` in an MCP stdio server. All diagnostic output must use `console.error`.
- **APIs**: arXiv API (`export.arxiv.org/api/query`) does not require an API key; respects rate limits (3-second spacing recommended between bulk queries).
- **Benchmark Datasets**: HarmBench, StrongREJECT, TruthfulQA, WMDP (Weapons of Mass Destruction Proxy), AdvGLUE, Machiavelli.

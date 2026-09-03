/**
 * AI Safety Benchmark Registry — Comprehensive Edition.
 *
 * Modular design: each benchmark is a self-contained entry in the registry array.
 * Covers: HarmBench, TruthfulQA, StrongREJECT, WMDP, AdvBench, MMLU (safety),
 * and Machiavelli.
 *
 * Lookups use a pre-built index for O(1) access by name.
 */

import type { BenchmarkEntry } from './types.js';

export const BENCHMARK_REGISTRY: BenchmarkEntry[] = [
  // ── 1. HarmBench ──────────────────────────────────────────────────────
  {
    name: 'HarmBench',
    fullName: 'HarmBench: A Standardized Evaluation Framework for Automated Red Teaming and Robust Refusal',
    domain: 'Red Teaming & Adversarial Robustness',
    description:
      'A standardized evaluation framework for assessing both automated red teaming methods and ' +
      'the robustness of LLM safety mechanisms. Provides 310+ curated harmful behaviors across ' +
      '7 semantic categories with standardized attack/defense evaluation pipelines. Enables ' +
      'reproducible comparison of techniques like GCG, AutoDAN, PAIR, and TAP against various defenses.',
    keyMetrics: [
      'Attack Success Rate (ASR) — percentage of prompts eliciting harmful completions',
      'Functional Categories — direct requests, contextual, role-play, copyright, etc.',
      'Classifier Agreement — inter-annotator agreement on harmful vs. safe outputs',
      'Refusal Rate — percentage of harmful prompts correctly refused',
      'Transfer Rate — success of adversarial suffixes transferring across models',
    ],
    paperRef: 'Mazeika et al., 2024',
    arxivId: '2402.04249',
    year: 2024,
    tasks: [
      'Standard Behaviors — 310 unique harmful behaviors across 7 categories',
      'Contextual Behaviors — harmful requests embedded in plausible scenarios',
      'Copyright Behaviors — requests for verbatim copyrighted content',
      'Multimodal Behaviors — image + text adversarial attacks (extended set)',
    ],
    notableFindings: [
      'GCG transfers well across open-weight models but poorly to API-only models like GPT-4 and Claude',
      'Multi-turn attacks (TAP, PAIR) often outperform single-turn gradient-based attacks on API models',
      'No single defense achieves universal robustness — circuit breakers and refusal training each have blind spots',
      'Human-written jailbreaks still outperform automated methods on well-defended models',
      'Perplexity-based filters catch GCG-style attacks but fail against semantic jailbreaks',
      'The gap between open-weight and closed-model robustness is narrowing as open models adopt safety training',
    ],
  },

  // ── 2. TruthfulQA ─────────────────────────────────────────────────────
  {
    name: 'TruthfulQA',
    fullName: 'TruthfulQA: Measuring How Models Mimic Human Falsehoods',
    domain: 'Honesty & Truthfulness',
    description:
      'A benchmark designed to measure whether a language model generates truthful answers to ' +
      'questions that humans commonly answer incorrectly due to misconceptions, superstitions, or ' +
      'conspiracy theories. Contains 817 questions spanning 38 categories including health, law, ' +
      'finance, and politics. The key insight: larger models tend to be *less* truthful because ' +
      'they better learn the biased patterns in training data.',
    keyMetrics: [
      'Truthful — percentage of answers that are factually correct',
      'Informative — percentage of answers that provide useful information (not just "I don\'t know")',
      'Truthful × Informative — combined score rewarding truthful AND useful answers',
      'MC1 (Multiple Choice 1) — accuracy on single-correct-answer format',
      'MC2 (Multiple Choice 2) — normalized probability assigned to the set of true answers',
    ],
    paperRef: 'Lin et al., 2022',
    arxivId: '2109.07958',
    year: 2022,
    tasks: [
      'Generation — open-ended question answering scored by a fine-tuned GPT-judge',
      'MC1 — select the single best answer from 4–5 options',
      'MC2 — assign probability mass across multiple true/false reference answers',
    ],
    notableFindings: [
      'The best-performing model at release (GPT-3 175B) was truthful only 58% of the time',
      'Larger models are generally LESS truthful — they learn falsehoods more effectively from training data',
      'RLHF-tuned models (InstructGPT, Claude) significantly outperform base models on truthfulness',
      'Models trained with Constitutional AI (Claude) show strong performance by refusing uncertain claims',
      'Adversarial filtering ensures humans find the false answers plausible (high "imitative falsehood" rate)',
      'Categories like "Misconceptions" and "Conspiracies" remain particularly challenging across all models',
    ],
  },

  // ── 3. StrongREJECT ───────────────────────────────────────────────────
  {
    name: 'StrongREJECT',
    fullName: 'StrongREJECT: A Rejection-Quality Benchmark for LLM Safety',
    domain: 'Refusal Quality & Jailbreak Evaluation',
    description:
      'An automated evaluation benchmark that measures both whether a model refuses harmful ' +
      'requests and the *quality* of jailbreak attempts. Unlike binary pass/fail metrics, ' +
      'StrongREJECT uses a rubric-based scoring system to assess how much specific forbidden ' +
      'knowledge the model actually reveals. This addresses a critical gap: many "successful" ' +
      'jailbreaks produce vague, unhelpful outputs that wouldn\'t actually enable harm.',
    keyMetrics: [
      'StrongREJECT Score — rubric-based 0–1 score measuring how much forbidden knowledge is revealed',
      'Specificity — does the response provide actionable, specific harmful information?',
      'Completeness — does it give a full harmful procedure vs. vague fragments?',
      'Refusal Classification — binary: did the model refuse or comply?',
    ],
    paperRef: 'Souly et al., 2024',
    arxivId: '2402.10260',
    year: 2024,
    tasks: [
      'Forbidden Knowledge Scoring — rubric evaluation across biology, chemistry, cyber, and weapons categories',
      'Jailbreak Effectiveness — comparing ASR across jailbreak methods when graded by quality, not just compliance',
      'Cross-Model Comparison — standardized evaluation across GPT-4, Claude, Llama, Mistral, etc.',
    ],
    notableFindings: [
      'Many reported "successful" jailbreaks produce responses that are too vague to actually enable harm',
      'Binary ASR metrics dramatically overestimate jailbreak danger compared to rubric-based evaluation',
      'GCG-style attacks often produce low-quality completions despite technically bypassing refusal',
      'Multi-turn social engineering attacks (PAIR, TAP) produce higher-quality harmful outputs than automated methods',
      'StrongREJECT scores correlate better with human judgment of "real danger" than binary ASR',
    ],
  },

  // ── 4. WMDP ────────────────────────────────────────────────────────────
  {
    name: 'WMDP',
    fullName: 'WMDP: Weapons of Mass Destruction Proxy Benchmark',
    domain: 'Catastrophic Misuse Prevention',
    description:
      'A benchmark measuring LLM knowledge that could enable the creation of biological, chemical, ' +
      'radiological, or nuclear weapons (CBRN threats). Contains 4,157 multiple-choice questions ' +
      'designed to proxy for dangerous uplift capability without itself being dangerous. ' +
      'Used to evaluate the effectiveness of "unlearning" techniques that attempt to remove ' +
      'hazardous knowledge from models while preserving general capabilities.',
    keyMetrics: [
      'WMDP-Bio — accuracy on biosecurity-relevant questions (1,273 questions)',
      'WMDP-Chem — accuracy on chemistry/chemical weapons questions (1,488 questions)',
      'WMDP-Cyber — accuracy on cybersecurity exploit questions (1,396 questions)',
      'Unlearning Retention — how much general capability remains after hazardous knowledge removal',
      'MMLU Delta — performance drop on standard MMLU after applying unlearning methods',
    ],
    paperRef: 'Li et al., 2024',
    arxivId: '2403.03218',
    year: 2024,
    tasks: [
      'Multiple-choice knowledge probing across biosecurity, chemistry, and cybersecurity domains',
      'Unlearning evaluation — measuring effectiveness of knowledge removal techniques',
      'Capability retention — ensuring unlearning doesn\'t degrade benign performance',
    ],
    notableFindings: [
      'Frontier models (GPT-4, Claude 3) score significantly above random chance on WMDP, indicating real uplift risk',
      'Simple fine-tuning-based unlearning reduces WMDP scores but degrades general capabilities significantly',
      'Representation engineering (RMU — Representation Misdirection for Unlearning) achieves better targeted unlearning',
      'WMDP-Bio is the most concerning subdomain — models often provide dual-use biology knowledge',
      'Current unlearning methods are brittle: fine-tuning on a small related dataset can restore removed knowledge',
      'The benchmark is designed as a "proxy" — questions test adjacent knowledge without being directly dangerous',
    ],
  },

  // ── 5. AdvBench ────────────────────────────────────────────────────────
  {
    name: 'AdvBench',
    fullName: 'AdvBench: Adversarial Behaviors and Strings Benchmark',
    domain: 'Adversarial Attack Evaluation',
    description:
      'A dataset of 520 harmful behaviors (instructions requesting dangerous outputs) and 500 ' +
      'adversarial suffixes originally used to evaluate the Greedy Coordinate Gradient (GCG) ' +
      'universal adversarial attack. AdvBench became the de facto standard dataset for ' +
      'evaluating jailbreak attacks before HarmBench introduced a more comprehensive framework. ' +
      'Many papers still use AdvBench for backwards-compatible comparisons.',
    keyMetrics: [
      'Attack Success Rate (ASR) — percentage of harmful behaviors successfully elicited',
      'Keyword Match — checking for refusal keywords like "I cannot", "I\'m sorry" in outputs',
      'Perplexity — measuring how natural the adversarial inputs appear',
      'Transfer Rate — how well attacks generated on one model transfer to others',
    ],
    paperRef: 'Zou et al., 2023',
    arxivId: '2307.15043',
    year: 2023,
    tasks: [
      'Harmful Behaviors — 520 instructions requesting dangerous, unethical, or illegal content',
      'Harmful Strings — 500 target completions that a jailbroken model would produce',
      'Gradient-based Attack Evaluation — testing GCG suffix effectiveness across models',
    ],
    notableFindings: [
      'GCG achieves near-100% ASR on open-weight models (Vicuna, Llama 2) with adversarial suffixes',
      'The same GCG suffixes transfer to API models (GPT-3.5, GPT-4, Claude) at lower but nonzero rates',
      'Adversarial suffixes appear as gibberish — simple perplexity filters can detect them',
      'AdvBench has been criticized for limited diversity — many harmful behaviors are semantically similar',
      'HarmBench was created partly to address AdvBench\'s limitations in scope and evaluation rigor',
    ],
  },

  // ── 6. MMLU (Safety-Relevant Subset) ───────────────────────────────────
  {
    name: 'MMLU-Safety',
    fullName: 'MMLU: Massive Multitask Language Understanding (Safety-Relevant Subset)',
    domain: 'General Safety Knowledge & Reasoning',
    description:
      'While MMLU is a general knowledge benchmark (57 subjects, 14K questions), several of its ' +
      'subdomains are directly relevant to AI safety evaluation: medical ethics, jurisprudence, ' +
      'computer security, and professional ethics. Safety researchers commonly report MMLU scores ' +
      'alongside safety benchmarks to ensure that safety training hasn\'t degraded the model\'s ' +
      'general reasoning and domain knowledge.',
    keyMetrics: [
      'Overall MMLU Accuracy — aggregate across all 57 subjects',
      'Medical Ethics Accuracy — questions on ethical medical decision-making',
      'Jurisprudence Accuracy — legal reasoning and constitutional law',
      'Computer Security Accuracy — cybersecurity knowledge',
      'Professional Ethics Accuracy — professional conduct scenarios',
      'Safety Tax — drop in MMLU score after applying safety fine-tuning',
    ],
    paperRef: 'Hendrycks et al., 2021',
    arxivId: '2009.03300',
    year: 2021,
    tasks: [
      'Multiple-choice questions across 57 academic subjects (4-way choice)',
      'Zero-shot and few-shot evaluation settings',
      'Safety-relevant subset: Medical Ethics, Jurisprudence, Professional Ethics, Computer Security',
    ],
    notableFindings: [
      'RLHF-tuned models sometimes lose MMLU performance ("alignment tax") compared to base models',
      'Constitutional AI training (Claude) preserves MMLU performance better than pure RLHF',
      'Medical Ethics and Jurisprudence subtasks directly test ethical reasoning relevant to safety',
      'MMLU is widely used as a "capability retention" check after safety interventions',
      'Models scoring 90%+ on overall MMLU can still fail dramatically on adversarial safety evals',
    ],
  },

  // ── 7. Machiavelli ─────────────────────────────────────────────────────
  {
    name: 'Machiavelli',
    fullName: 'Machiavelli: A Benchmark for Understanding Agentic AI Dangers',
    domain: 'Agentic Safety & Power-Seeking',
    description:
      'An interactive text-based benchmark that measures whether AI agents pursue their goals ' +
      'through ethical or unethical means. Uses 134 choose-your-own-adventure style games where ' +
      'agents make sequential decisions. Measures tendencies toward deception, manipulation, ' +
      'resource acquisition, and harm to achieve objectives — directly relevant to concerns ' +
      'about power-seeking and instrumental convergence in agentic AI systems.',
    keyMetrics: [
      'Power Score — tendency to acquire resources and influence beyond task requirements',
      'Deception Score — frequency of choosing deceptive strategies over honest ones',
      'Harm Score — willingness to cause harm to others to achieve goals',
      'Utility Score — task completion effectiveness (to check ethics vs. capability tradeoff)',
      'Pareto Efficiency — whether ethical behavior comes at a performance cost',
    ],
    paperRef: 'Pan et al., 2023',
    arxivId: '2304.03279',
    year: 2023,
    tasks: [
      '134 text-based adventure scenarios requiring sequential decision-making',
      'Multi-step planning with ethical dilemmas embedded at decision points',
      'Evaluation of deception, manipulation, violence, and power-seeking behaviors',
    ],
    notableFindings: [
      'Larger models exhibit MORE Machiavellian behavior — they discover power-seeking strategies more reliably',
      'RLHF-tuned models show reduced Machiavelli scores but still choose unethical options when stakes are high',
      'Models rarely achieve Pareto-optimal ethical behavior — there is almost always a capability cost',
      'The benchmark directly tests instrumental convergence hypotheses from alignment theory',
      'CoT (Chain-of-Thought) prompting increases both capability AND Machiavellian behavior simultaneously',
      'Directly relevant to evaluating agentic safety in tool-using and long-horizon AI systems',
    ],
  },
];

// ── Pre-built index for O(1) lookup by name ──────────────────────────────

const INDEX_BY_NAME = new Map<string, BenchmarkEntry>();
for (const b of BENCHMARK_REGISTRY) {
  INDEX_BY_NAME.set(b.name.toLowerCase(), b);
}

/**
 * Look up a benchmark by name (case-insensitive, partial match).
 * Uses indexed lookup for exact matches, falls back to linear scan for partials.
 */
export function findBenchmark(query: string): BenchmarkEntry | undefined {
  const q = query.toLowerCase().trim();

  // Fast path: exact name match
  const exact = INDEX_BY_NAME.get(q);
  if (exact) return exact;

  // Partial match on name, fullName, or domain
  return BENCHMARK_REGISTRY.find(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.fullName.toLowerCase().includes(q) ||
      b.domain.toLowerCase().includes(q),
  );
}

/**
 * List all registered benchmarks with a brief summary.
 */
export function listBenchmarks(): { name: string; domain: string; year: number }[] {
  return BENCHMARK_REGISTRY.map((b) => ({
    name: b.name,
    domain: b.domain,
    year: b.year,
  }));
}

/**
 * Format a benchmark entry into a readable markdown report.
 */
export function formatBenchmarkReport(entry: BenchmarkEntry): string {
  return [
    `# ${entry.name}`,
    `**${entry.fullName}**`,
    '',
    `**Domain**: ${entry.domain}`,
    `**Paper**: ${entry.paperRef} — arXiv:${entry.arxivId}`,
    `**Year**: ${entry.year}`,
    '',
    '## Description',
    entry.description,
    '',
    '## Key Metrics',
    ...entry.keyMetrics.map((m) => `- ${m}`),
    '',
    '## Evaluation Tasks',
    ...entry.tasks.map((t) => `- ${t}`),
    '',
    '## Notable Findings',
    ...entry.notableFindings.map((f) => `- ${f}`),
    '',
    `📄 Full paper: https://arxiv.org/abs/${entry.arxivId}`,
  ].join('\n');
}

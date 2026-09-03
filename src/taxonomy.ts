/**
 * AI Alignment & Safety Taxonomy Reference.
 *
 * A structured knowledge base of alignment concepts, frameworks, and research areas.
 * Claude can query this to understand how a paper or concept fits into the broader
 * AI safety landscape.
 */

import type { TaxonomyEntry } from './types.js';

export const TAXONOMY: TaxonomyEntry[] = [
  // ── Alignment Approaches ──────────────────────────────────────────────
  {
    concept: 'Constitutional AI (CAI)',
    category: 'Alignment Approach',
    definition:
      'A method developed by Anthropic where an AI system is trained to follow a set of ' +
      'principles (a "constitution") rather than relying solely on human feedback for every judgment. ' +
      'The model critiques and revises its own outputs based on these principles, then is fine-tuned ' +
      'on the self-revised outputs (RLAIF). This reduces dependence on human labelers and scales oversight.',
    keyPapers: ['2212.08073', '2310.07713'],
    relatedConcepts: ['RLAIF', 'Scalable Oversight', 'Self-Alignment'],
    anthropicRelevance: 'Core to Anthropic\'s alignment strategy. Claude\'s safety training uses Constitutional AI principles.',
  },
  {
    concept: 'RLHF (Reinforcement Learning from Human Feedback)',
    category: 'Alignment Approach',
    definition:
      'A training paradigm where a reward model is learned from human preference comparisons, ' +
      'then used to fine-tune the language model via reinforcement learning (typically PPO). ' +
      'RLHF was the primary method for aligning early ChatGPT and Claude models, though it has ' +
      'known failure modes including reward hacking and sycophancy.',
    keyPapers: ['2203.02155', '1706.03741'],
    relatedConcepts: ['Reward Modeling', 'PPO', 'Constitutional AI', 'RLAIF'],
    anthropicRelevance: 'Foundational to Anthropic\'s earlier alignment work. Anthropic co-authored the seminal RLHF papers.',
  },
  {
    concept: 'RLAIF (Reinforcement Learning from AI Feedback)',
    category: 'Alignment Approach',
    definition:
      'A variant of RLHF where the preference labels used to train the reward model come from ' +
      'another AI system rather than human annotators. The AI evaluator is guided by a constitution ' +
      'or set of principles. This enables faster iteration and reduces the bottleneck of human labeling.',
    keyPapers: ['2212.08073', '2309.00267'],
    relatedConcepts: ['Constitutional AI', 'RLHF', 'Self-Alignment'],
    anthropicRelevance: 'Key mechanism in Constitutional AI. Enables Anthropic to scale alignment training.',
  },

  // ── Safety Evaluation ─────────────────────────────────────────────────
  {
    concept: 'Red Teaming',
    category: 'Safety Evaluation',
    definition:
      'The practice of deliberately probing an AI system for failures, vulnerabilities, and harmful ' +
      'outputs. Red teaming can be manual (human testers craft adversarial inputs) or automated ' +
      '(using other models or gradient-based methods to discover failure modes). It is a critical ' +
      'pre-deployment safety practice.',
    keyPapers: ['2202.03286', '2209.07858'],
    relatedConcepts: ['Jailbreaking', 'Adversarial Robustness', 'HarmBench'],
    anthropicRelevance: 'Anthropic conducts extensive red teaming before each Claude release and publishes red team findings.',
  },
  {
    concept: 'Jailbreaking',
    category: 'Safety Evaluation',
    definition:
      'Techniques that circumvent an LLM\'s safety training to elicit harmful, restricted, or ' +
      'policy-violating outputs. Methods range from simple role-play prompts to sophisticated ' +
      'gradient-based adversarial suffixes (GCG), multi-turn persuasion (PAIR/TAP), and encoded ' +
      'instruction injection. Jailbreak robustness is a primary safety metric.',
    keyPapers: ['2307.15043', '2402.04249'],
    relatedConcepts: ['Red Teaming', 'Adversarial Robustness', 'HarmBench', 'GCG'],
    anthropicRelevance: 'Claude\'s multi-layered safety training specifically targets known jailbreak families.',
  },

  // ── Interpretability ──────────────────────────────────────────────────
  {
    concept: 'Mechanistic Interpretability',
    category: 'Interpretability',
    definition:
      'A research program focused on reverse-engineering the internal computations of neural networks ' +
      'by identifying meaningful features, circuits, and algorithms within the model\'s weights and ' +
      'activations. The goal is to understand *how* a model arrives at its outputs, not just *what* ' +
      'it outputs. Key techniques include sparse autoencoders, circuit discovery, and feature visualization.',
    keyPapers: ['2211.00593', '2309.10312', '2406.04093'],
    relatedConcepts: ['Superposition', 'Sparse Autoencoders', 'Circuit Discovery', 'Activation Steering'],
    anthropicRelevance: 'Anthropic leads frontier mechanistic interpretability research. Their team published foundational work on superposition and dictionary learning.',
  },
  {
    concept: 'Activation Steering / Representation Engineering',
    category: 'Interpretability',
    definition:
      'Techniques that modify a model\'s behavior at inference time by adding learned "steering vectors" ' +
      'to its internal activations. Instead of retraining, you compute a direction in activation space ' +
      'that corresponds to a behavioral trait (e.g., honesty, refusal, harmlessness) and add or ' +
      'subtract it during forward passes. This offers fine-grained behavioral control without weight modification.',
    keyPapers: ['2310.01405', '2306.03341'],
    relatedConcepts: ['Mechanistic Interpretability', 'Control Vectors', 'Inference-Time Intervention'],
    anthropicRelevance: 'Active area of research at Anthropic for understanding and controlling Claude\'s behavior without retraining.',
  },

  // ── Alignment Theory ──────────────────────────────────────────────────
  {
    concept: 'Scalable Oversight',
    category: 'Alignment Theory',
    definition:
      'The challenge of maintaining reliable human oversight of AI systems as they become more capable ' +
      'than their overseers in specific domains. Proposed solutions include recursive reward modeling, ' +
      'debate between AI systems, and market-based mechanisms. The core problem: how do you evaluate ' +
      'an AI\'s output when you can\'t independently verify its correctness?',
    keyPapers: ['1811.07871', '2211.03540'],
    relatedConcepts: ['Constitutional AI', 'Debate', 'Recursive Reward Modeling'],
    anthropicRelevance: 'Central to Anthropic\'s long-term alignment roadmap. Constitutional AI is partly a scalable oversight mechanism.',
  },
  {
    concept: 'Inner Alignment / Mesa-Optimization',
    category: 'Alignment Theory',
    definition:
      'The risk that a model trained via gradient descent develops an internal optimization process ' +
      '(a "mesa-optimizer") whose objective differs from the training objective. The mesa-optimizer ' +
      'may behave correctly during training but pursue different goals at deployment — this is called ' +
      '"deceptive alignment." This is a theoretical but widely discussed existential risk.',
    keyPapers: ['1906.01820', '2307.15217'],
    relatedConcepts: ['Deceptive Alignment', 'Goal Misgeneralization', 'Reward Hacking'],
    anthropicRelevance: 'Anthropic researchers co-authored foundational mesa-optimization work and actively study model organisms of misalignment.',
  },
  {
    concept: 'Deceptive Alignment',
    category: 'Alignment Theory',
    definition:
      'A hypothetical failure mode where an AI system strategically appears aligned during training ' +
      'and evaluation, but pursues misaligned goals when it detects it is no longer being monitored ' +
      'or evaluated. The system "deceives" its overseers to avoid correction. Whether current LLMs ' +
      'can exhibit this behavior is actively debated.',
    keyPapers: ['1906.01820', '2311.08379'],
    relatedConcepts: ['Inner Alignment', 'Mesa-Optimization', 'Sleeper Agents'],
    anthropicRelevance: 'Anthropic published the "Sleeper Agents" paper demonstrating that deceptive behaviors can persist through safety training.',
  },

  // ── Practical Safety ──────────────────────────────────────────────────
  {
    concept: 'Responsible Scaling Policy (RSP)',
    category: 'AI Governance',
    definition:
      'A framework adopted by Anthropic that ties the deployment of increasingly capable AI systems ' +
      'to demonstrated safety measures. As models reach higher capability thresholds (ASL levels), ' +
      'proportionally stronger security, alignment, and monitoring commitments must be met before ' +
      'deployment. This provides a structured, incremental approach to frontier AI safety.',
    keyPapers: [],
    relatedConcepts: ['AI Safety Levels (ASL)', 'Capability Elicitation', 'Deployment Gates'],
    anthropicRelevance: 'Anthropic\'s core governance framework. Claude releases are gated by ASL evaluations.',
  },
];

/**
 * Search taxonomy entries by concept, category, or free text.
 */
export function searchTaxonomy(query: string): TaxonomyEntry[] {
  const q = query.toLowerCase();
  return TAXONOMY.filter(
    (t) =>
      t.concept.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      t.relatedConcepts.some((rc) => rc.toLowerCase().includes(q)),
  );
}

/**
 * Get all unique taxonomy categories.
 */
export function listCategories(): string[] {
  return [...new Set(TAXONOMY.map((t) => t.category))];
}

/**
 * Format a taxonomy entry into readable text.
 */
export function formatTaxonomyEntry(entry: TaxonomyEntry): string {
  const lines: string[] = [
    `## ${entry.concept}`,
    `**Category**: ${entry.category}`,
    '',
    entry.definition,
    '',
  ];

  if (entry.keyPapers.length > 0) {
    lines.push('**Key Papers**:');
    for (const p of entry.keyPapers) {
      lines.push(`- arXiv:${p} — https://arxiv.org/abs/${p}`);
    }
    lines.push('');
  }

  lines.push(`**Related Concepts**: ${entry.relatedConcepts.join(', ')}`);
  lines.push('');
  lines.push(`**Anthropic Relevance**: ${entry.anthropicRelevance}`);

  return lines.join('\n');
}

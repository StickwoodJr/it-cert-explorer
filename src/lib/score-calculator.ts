export type ScoreConfidence = 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT_DATA';

export interface ScoreInputs {
  marketValueScore: number; // 0-100 (Salary benchmarks)
  demandScore: number; // 0-100 (Job postings frequency)
  rigorScore: number; // 0-100 (Hands-on vs MCQ vs Lab duration)
  communityPerceptionScore: number; // 0-100 (Practitioner sentiment)
  status: 'ACTIVE' | 'BEING_REPLACED' | 'RETIRED';
  confidence?: {
    marketValue?: ScoreConfidence;
    demand?: ScoreConfidence;
    rigor?: ScoreConfidence;
    community?: ScoreConfidence;
  };
  provenanceNotes?: {
    marketValue?: string;
    demand?: string;
    rigor?: string;
    community?: string;
  };
}

export interface ScoreBreakdown {
  marketValue: number;
  demand: number;
  rigor: number;
  community: number;
  currencyMultiplier: number;
  rawScore: number;
  overallScore: number;
  weights: {
    marketValue: number;
    demand: number;
    rigor: number;
    community: number;
  };
  confidence: {
    marketValue: ScoreConfidence;
    demand: ScoreConfidence;
    rigor: ScoreConfidence;
    community: ScoreConfidence;
  };
  provenanceNotes: {
    marketValue: string;
    demand: string;
    rigor: string;
    community: string;
  };
}

export const SCORE_WEIGHTS = {
  marketValue: 0.3,
  demand: 0.3,
  rigor: 0.2,
  community: 0.2,
};

export const CURRENCY_MULTIPLIERS = {
  ACTIVE: 1.0,
  BEING_REPLACED: 0.85,
  RETIRED: 0.5,
};

export function calculateRatingScore(inputs: ScoreInputs): ScoreBreakdown {
  const mv = Math.min(100, Math.max(0, inputs.marketValueScore));
  const dm = Math.min(100, Math.max(0, inputs.demandScore));
  const rg = Math.min(100, Math.max(0, inputs.rigorScore));
  const cm = Math.min(100, Math.max(0, inputs.communityPerceptionScore));

  const rawScore =
    mv * SCORE_WEIGHTS.marketValue +
    dm * SCORE_WEIGHTS.demand +
    rg * SCORE_WEIGHTS.rigor +
    cm * SCORE_WEIGHTS.community;

  const multiplier = CURRENCY_MULTIPLIERS[inputs.status] ?? 1.0;
  const overallScore = Math.round(rawScore * multiplier * 10) / 10;

  return {
    marketValue: mv,
    demand: dm,
    rigor: rg,
    community: cm,
    currencyMultiplier: multiplier,
    rawScore: Math.round(rawScore * 10) / 10,
    overallScore,
    weights: SCORE_WEIGHTS,
    confidence: {
      marketValue: inputs.confidence?.marketValue ?? 'ESTIMATED',
      demand: inputs.confidence?.demand ?? 'ESTIMATED',
      rigor: inputs.confidence?.rigor ?? 'VERIFIED',
      community: inputs.confidence?.community ?? 'INSUFFICIENT_DATA',
    },
    provenanceNotes: {
      marketValue: inputs.provenanceNotes?.marketValue ?? 'Skillsoft IT Skills & Salary Survey / BLS tech wage index benchmarks',
      demand: inputs.provenanceNotes?.demand ?? 'BLS occupational demand index & tech job requisition frequency',
      rigor: inputs.provenanceNotes?.rigor ?? 'Derived from verified exam format, duration, and practical lab requirements in official vendor blueprint',
      community: inputs.provenanceNotes?.community ?? 'Provisional community sentiment estimate; pending formal multi-forum survey integration',
    },
  };
}

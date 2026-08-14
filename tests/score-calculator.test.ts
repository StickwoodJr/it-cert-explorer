import { describe, it, expect } from 'vitest';
import { calculateRatingScore } from '../src/lib/score-calculator';

describe('Rating Score Composite Calculator', () => {
  it('calculates score for active certification with standard weights (30/30/20/20)', () => {
    // Market: 80, Demand: 90, Rigor: 70, Community: 85
    // Raw: 80*0.3 + 90*0.3 + 70*0.2 + 85*0.2 = 24 + 27 + 14 + 17 = 82
    const result = calculateRatingScore({
      marketValueScore: 80,
      demandScore: 90,
      rigorScore: 70,
      communityPerceptionScore: 85,
      status: 'ACTIVE',
    });

    expect(result.rawScore).toBe(82);
    expect(result.currencyMultiplier).toBe(1.0);
    expect(result.overallScore).toBe(82);
  });

  it('applies currency penalty (0.85) for BEING_REPLACED certifications', () => {
    const result = calculateRatingScore({
      marketValueScore: 80,
      demandScore: 80,
      rigorScore: 80,
      communityPerceptionScore: 80,
      status: 'BEING_REPLACED',
    });

    expect(result.rawScore).toBe(80);
    expect(result.currencyMultiplier).toBe(0.85);
    expect(result.overallScore).toBe(68); // 80 * 0.85
  });

  it('applies heavy penalty (0.50) for RETIRED certifications', () => {
    const result = calculateRatingScore({
      marketValueScore: 80,
      demandScore: 80,
      rigorScore: 80,
      communityPerceptionScore: 80,
      status: 'RETIRED',
    });

    expect(result.rawScore).toBe(80);
    expect(result.currencyMultiplier).toBe(0.5);
    expect(result.overallScore).toBe(40); // 80 * 0.5
  });

  it('clamps sub-scores between 0 and 100', () => {
    const result = calculateRatingScore({
      marketValueScore: 150,
      demandScore: -20,
      rigorScore: 100,
      communityPerceptionScore: 0,
      status: 'ACTIVE',
    });

    // 100*0.3 + 0*0.3 + 100*0.2 + 0*0.2 = 30 + 20 = 50
    expect(result.marketValue).toBe(100);
    expect(result.demand).toBe(0);
    expect(result.overallScore).toBe(50);
  });

  it('provides confidence ratings and provenance notes for all 4 sub-scores', () => {
    const result = calculateRatingScore({
      marketValueScore: 98,
      demandScore: 99,
      rigorScore: 92,
      communityPerceptionScore: 96,
      status: 'ACTIVE',
      confidence: {
        marketValue: 'VERIFIED',
        demand: 'VERIFIED',
        rigor: 'VERIFIED',
        community: 'INSUFFICIENT_DATA',
      },
    });

    expect(result.confidence.marketValue).toBe('VERIFIED');
    expect(result.confidence.demand).toBe('VERIFIED');
    expect(result.confidence.rigor).toBe('VERIFIED');
    expect(result.confidence.community).toBe('INSUFFICIENT_DATA');
    expect(result.provenanceNotes.community).toContain('community sentiment');
  });
});

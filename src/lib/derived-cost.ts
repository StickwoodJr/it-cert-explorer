export interface ExamCostInfo {
  id: string;
  examCode: string;
  name: string;
  costAmountUsd: number | { toNumber?: () => number; toString: () => string } | any;
  costAmountCadOverride?: number | { toNumber?: () => number; toString: () => string } | null | any;
}

export interface PrerequisiteGroupForCost {
  id: string;
  logicType: 'AND' | 'OR' | string;
  minRequired?: number | null;
  groupLabel?: string | null;
  childGroups?: PrerequisiteGroupForCost[] | any;
  members: {
    memberType: 'EXAM' | 'CERTIFICATION' | 'EXPERIENCE' | 'DEGREE' | 'OTHER_CREDENTIAL' | string;
    exam?: ExamCostInfo | null | any;
  }[];
}

export interface ComputedCertificationCost {
  minUsd: number;
  maxUsd: number;
  isRange: boolean;
  minCad: number;
  maxCad: number;
  formattedUsd: string;
  formattedCad: string;
  examCount: number;
  minCostUsd: number;
  maxCostUsd: number;
  minCostCad: number;
  maxCostCad: number;
  breakdownNotes?: string[];
}

function evaluateGroupCost(
  group: PrerequisiteGroupForCost,
  usdToCadRate: number
): { minUsd: number; maxUsd: number; minCad: number; maxCad: number; examCount: number } {
  // Collect all exam items in this group
  const examMembers = group.members
    .filter((m) => m.memberType === 'EXAM' && m.exam)
    .map((m) => {
      const rawUsd = m.exam!.costAmountUsd;
      const usd = typeof rawUsd === 'number' ? rawUsd : Number(rawUsd);
      const rawCad = m.exam!.costAmountCadOverride;
      const cad = rawCad != null
        ? (typeof rawCad === 'number' ? rawCad : Number(rawCad))
        : Math.round(usd * usdToCadRate * 100) / 100;
      return { usd, cad };
    });

  // Collect child group costs
  const childResults = (group.childGroups || []).map((cg: any) => evaluateGroupCost(cg, usdToCadRate));

  if (group.logicType === 'AND') {
    // All members and child groups required -> Sum everything
    let sumMinUsd = 0;
    let sumMaxUsd = 0;
    let sumMinCad = 0;
    let sumMaxCad = 0;
    let totalExamCount = 0;

    for (const exam of examMembers) {
      sumMinUsd += exam.usd;
      sumMaxUsd += exam.usd;
      sumMinCad += exam.cad;
      sumMaxCad += exam.cad;
      totalExamCount += 1;
    }

    for (const child of childResults) {
      sumMinUsd += child.minUsd;
      sumMaxUsd += child.maxUsd;
      sumMinCad += child.minCad;
      sumMaxCad += child.maxCad;
      totalExamCount += child.examCount;
    }

    return {
      minUsd: sumMinUsd,
      maxUsd: sumMaxUsd,
      minCad: sumMinCad,
      maxCad: sumMaxCad,
      examCount: totalExamCount,
    };
  } else {
    // OR logic -> Candidate chooses minRequired items
    const k = Math.max(1, group.minRequired || 1);
    const candidateOptions: { usd: number; cad: number; examCount: number }[] = [
      ...examMembers.map((e) => ({ usd: e.usd, cad: e.cad, examCount: 1 })),
      ...childResults.map((c: any) => ({ usd: c.minUsd, cad: c.minCad, examCount: c.examCount })),
    ];

    if (candidateOptions.length === 0) {
      return { minUsd: 0, maxUsd: 0, minCad: 0, maxCad: 0, examCount: 0 };
    }

    // Sort ascending for min, descending for max
    const sortedByUsdAsc = [...candidateOptions].sort((a, b) => a.usd - b.usd);
    const sortedByUsdDesc = [...candidateOptions].sort((a, b) => b.usd - a.usd);

    const minUsd = sortedByUsdAsc.slice(0, k).reduce((acc, curr) => acc + curr.usd, 0);
    const maxUsd = sortedByUsdDesc.slice(0, k).reduce((acc, curr) => acc + curr.usd, 0);

    const sortedByCadAsc = [...candidateOptions].sort((a, b) => a.cad - b.cad);
    const sortedByCadDesc = [...candidateOptions].sort((a, b) => b.cad - a.cad);

    const minCad = sortedByCadAsc.slice(0, k).reduce((acc, curr) => acc + curr.cad, 0);
    const maxCad = sortedByCadDesc.slice(0, k).reduce((acc, curr) => acc + curr.cad, 0);

    return {
      minUsd,
      maxUsd,
      minCad,
      maxCad,
      examCount: k,
    };
  }
}

export function computeCertificationCost(
  groups: any[],
  usdToCadRate = 1.36
): ComputedCertificationCost {
  // Top-level groups are all required (AND combined across distinct groups)
  let totalMinUsd = 0;
  let totalMaxUsd = 0;
  let totalMinCad = 0;
  let totalMaxCad = 0;
  let totalExamCount = 0;

  for (const group of groups) {
    const res = evaluateGroupCost(group, usdToCadRate);
    totalMinUsd += res.minUsd;
    totalMaxUsd += res.maxUsd;
    totalMinCad += res.minCad;
    totalMaxCad += res.maxCad;
    totalExamCount += res.examCount;
  }

  const isRange = totalMinUsd !== totalMaxUsd;

  const formattedUsd = isRange
    ? `$${totalMinUsd.toLocaleString()} – $${totalMaxUsd.toLocaleString()} USD`
    : `$${totalMinUsd.toLocaleString()} USD`;

  const formattedCad = isRange
    ? `$${Math.round(totalMinCad).toLocaleString()} – $${Math.round(totalMaxCad).toLocaleString()} CAD`
    : `$${Math.round(totalMinCad).toLocaleString()} CAD`;

  return {
    minUsd: totalMinUsd,
    maxUsd: totalMaxUsd,
    isRange,
    minCad: totalMinCad,
    maxCad: totalMaxCad,
    formattedUsd,
    formattedCad,
    examCount: totalExamCount,
    minCostUsd: totalMinUsd,
    maxCostUsd: totalMaxUsd,
    minCostCad: totalMinCad,
    maxCostCad: totalMaxCad,
    breakdownNotes: [],
  };
}

export const calculateCertificationCost = computeCertificationCost;

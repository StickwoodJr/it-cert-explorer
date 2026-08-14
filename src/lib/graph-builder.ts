import { prisma } from './db';
import { computeCertificationCost, PrerequisiteGroupForCost } from './derived-cost';
import { GraphExport, GraphNode, GraphEdge } from '../types/graph';
import { getUsdToCadRate } from './currency';

export type { GraphExport, GraphNode, GraphEdge };

export interface GraphFilterOptions {
  domainId?: string;
  vendorId?: string;
  level?: string;
  roleId?: string;
  maxCostUsd?: number;
  minScore?: number;
  includeRetired?: boolean;
}

export async function buildGraphExport(filters: GraphFilterOptions = {}): Promise<GraphExport> {
  const { rate: usdToCadRate } = await getUsdToCadRate();

  // Query certifications from database
  const whereClause: any = {};

  if (!filters.includeRetired) {
    whereClause.status = { not: 'RETIRED' };
  }

  if (filters.vendorId) {
    whereClause.vendorId = filters.vendorId;
  }

  if (filters.level) {
    whereClause.level = filters.level.toUpperCase();
  }

  if (filters.domainId) {
    whereClause.domains = {
      some: {
        domainId: filters.domainId,
      },
    };
  }

  if (filters.roleId) {
    whereClause.roles = {
      some: {
        roleId: filters.roleId,
      },
    };
  }

  if (filters.minScore !== undefined) {
    whereClause.computedScore = {
      gte: filters.minScore,
    };
  }

  const rawCerts = await prisma.certification.findMany({
    where: whereClause,
    include: {
      vendor: true,
      domains: {
        include: {
          domain: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
      prerequisiteGroups: {
        include: {
          childGroups: {
            include: {
              childGroups: {
                include: {
                  members: {
                    include: {
                      exam: true,
                      certification: true,
                    },
                  },
                },
              },
              members: {
                include: {
                  exam: true,
                  certification: true,
                },
              },
            },
          },
          members: {
            include: {
              exam: true,
              certification: true,
            },
          },
        },
      },
    },
  });

  const nodes: GraphNode[] = [];
  const edgeMap = new Map<string, GraphEdge>();
  const certIdSet = new Set<string>();

  // Helper to extract exam summary
  function getExamSummary(groups: any[]): string {
    const codes: string[] = [];
    function collectExamCodes(gList: any[]) {
      for (const g of gList) {
        for (const m of g.members || []) {
          if (m.memberType === 'EXAM' && m.exam?.examCode) {
            codes.push(m.exam.examCode);
          }
        }
        if (g.childGroups) collectExamCodes(g.childGroups);
      }
    }
    collectExamCodes(groups);
    return Array.from(new Set(codes)).join(', ') || 'N/A';
  }

  for (const cert of rawCerts) {
    // Transform prerequisite groups for cost calculator
    const groupsForCost: PrerequisiteGroupForCost[] = cert.prerequisiteGroups.map((g) => ({
      id: g.id,
      logicType: g.logicType,
      minRequired: g.minRequired,
      groupLabel: g.groupLabel,
      childGroups: g.childGroups?.map((cg) => ({
        id: cg.id,
        logicType: cg.logicType,
        minRequired: cg.minRequired,
        groupLabel: cg.groupLabel,
        members: cg.members.map((m) => ({
          memberType: m.memberType,
          exam: m.exam
            ? {
                id: m.exam.id,
                examCode: m.exam.examCode,
                name: m.exam.name,
                costAmountUsd: Number(m.exam.costAmountUsd),
                costAmountCadOverride: m.exam.costAmountCadOverride
                  ? Number(m.exam.costAmountCadOverride)
                  : null,
              }
            : null,
        })),
      })),
      members: g.members.map((m) => ({
        memberType: m.memberType,
        exam: m.exam
          ? {
              id: m.exam.id,
              examCode: m.exam.examCode,
              name: m.exam.name,
              costAmountUsd: Number(m.exam.costAmountUsd),
              costAmountCadOverride: m.exam.costAmountCadOverride
                ? Number(m.exam.costAmountCadOverride)
                : null,
            }
          : null,
      })),
    }));

    const cost = computeCertificationCost(groupsForCost, usdToCadRate);

    // Apply maxCost filter if present
    if (filters.maxCostUsd !== undefined && cost.minUsd > filters.maxCostUsd) {
      continue;
    }

    certIdSet.add(cert.id);

    nodes.push({
      id: cert.id,
      label: cert.acronym,
      fullName: cert.name,
      vendorId: cert.vendorId,
      vendorName: cert.vendor.shortName,
      domains: cert.domains.map((d) => d.domainId),
      roles: cert.roles.map((r) => r.roleId),
      level: cert.level,
      status: cert.status,
      score: cert.computedScore ? Number(cert.computedScore) : 0,
      scoreBreakdown: cert.scoreBreakdown as any,
      computedCostUsd: cost.minUsd,
      computedCostCad: cost.minCad,
      isCostRange: cost.isRange,
      costDisplayUsd: cost.formattedUsd,
      costDisplayCad: cost.formattedCad,
      renewalMonths: cert.renewalPeriodMonths,
      examSummary: getExamSummary(cert.prerequisiteGroups),
      officialUrl: cert.officialUrl,
    });

    // Traverse and collect edges from certification prerequisites
    function collectCertEdges(targetId: string, groupList: any[]) {
      for (const group of groupList) {
        for (const member of group.members || []) {
          if (
            member.memberType === 'CERTIFICATION' &&
            member.certificationId &&
            member.certificationId !== targetId
          ) {
            const edgeType = member.edgeType.toLowerCase() as 'required' | 'recommended' | 'alternative';
            const edgeKey = `${member.certificationId}->${targetId}:${edgeType}`;
            if (!edgeMap.has(edgeKey)) {
              edgeMap.set(edgeKey, {
                id: `edge:${member.certificationId}-${targetId}-${edgeType}`,
                source: member.certificationId,
                target: targetId,
                type: edgeType,
                label: member.notes || group.groupLabel || undefined,
                groupId: group.id,
              });
            }
          }
        }
        if (group.childGroups) {
          collectCertEdges(targetId, group.childGroups);
        }
      }
    }

    collectCertEdges(cert.id, cert.prerequisiteGroups);
  }

  // Precedence deduplication: if required or alternative exists for (source, target), drop recommended
  const rawFilteredEdges = Array.from(edgeMap.values()).filter(
    (edge) => certIdSet.has(edge.source) && certIdSet.has(edge.target)
  );

  const pairGrouped = new Map<string, GraphEdge[]>();
  for (const edge of rawFilteredEdges) {
    const pairKey = `${edge.source}->${edge.target}`;
    if (!pairGrouped.has(pairKey)) pairGrouped.set(pairKey, []);
    pairGrouped.get(pairKey)!.push(edge);
  }

  const finalEdges: GraphEdge[] = [];
  for (const [, pairEdges] of pairGrouped.entries()) {
    if (pairEdges.length === 1) {
      finalEdges.push(pairEdges[0]);
    } else {
      // If there's a required edge, prefer required
      const reqEdge = pairEdges.find((e) => e.type === 'required');
      const altEdge = pairEdges.find((e) => e.type === 'alternative');
      if (reqEdge) {
        finalEdges.push(reqEdge);
      } else if (altEdge) {
        finalEdges.push(altEdge);
      } else {
        finalEdges.push(pairEdges[0]);
      }
    }
  }

  return {
    nodes,
    edges: finalEdges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: finalEdges.length,
      generatedAt: new Date().toISOString(),
      cadExchangeRate: usdToCadRate,
    },
  };
}

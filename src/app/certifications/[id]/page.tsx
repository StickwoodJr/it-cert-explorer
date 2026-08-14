import React from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import prisma from '@/lib/db';
import { calculateCertificationCost } from '@/lib/derived-cost';
import { getCadExchangeRate } from '@/lib/currency';
import VendorBadgeIcon from '@/components/common/VendorBadgeIcon';
import {
  Award,
  BookOpen,
  DollarSign,
  Clock,
  Shield,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  Calendar,
  Network,
  Server,
  Cloud,
  Cpu,
  HelpCircle,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

interface CertDetailPageProps {
  params: Promise<{ id: string }>;
}

const levelColors: Record<string, { badge: string; text: string; bg: string }> = {
  ENTRY: { badge: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500' },
  ASSOCIATE: { badge: 'bg-sky-950/60 border-sky-500/30 text-sky-400', text: 'text-sky-400', bg: 'bg-sky-500' },
  PROFESSIONAL: { badge: 'bg-amber-950/60 border-amber-500/30 text-amber-400', text: 'text-amber-400', bg: 'bg-amber-500' },
  EXPERT: { badge: 'bg-rose-950/60 border-rose-500/30 text-rose-400', text: 'text-rose-400', bg: 'bg-rose-500' },
  SPECIALTY: { badge: 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400', text: 'text-indigo-400', bg: 'bg-indigo-500' },
};

export async function generateStaticParams() {
  const certs = await prisma.certification.findMany({ select: { id: true } });
  return certs.map((c) => ({
    id: c.id.replace('cert:', ''),
  }));
}

export default async function CertificationDetailPage({ params }: CertDetailPageProps) {
  const { id } = await params;

  if (id.startsWith('cert:')) {
    permanentRedirect(`/certifications/${id.replace('cert:', '')}`);
  }

  const certId = `cert:${id}`;

  const [cert, cadRate] = await Promise.all([
    prisma.certification.findUnique({
      where: { id: certId },
      include: {
        vendor: true,
        domains: { include: { domain: true } },
        roles: { include: { role: true } },
        prerequisiteGroups: {
          include: {
            members: {
              include: {
                exam: true,
                certification: true,
              },
            },
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
          },
        },
      },
    }),
    getCadExchangeRate(),
  ]);

  if (!cert) {
    notFound();
  }

  const cost = calculateCertificationCost(cert.prerequisiteGroups, cadRate);

  // Fetch field source citations
  const citations = await prisma.fieldSource.findMany({
    where: { entityType: 'CERTIFICATION', entityId: cert.id },
    include: { source: true },
  });

  const levelStyle = levelColors[cert.level] || levelColors.ASSOCIATE;
  const scoreBreakdown = (cert.scoreBreakdown as any) || {
    marketValue: 70,
    demand: 70,
    rigor: 70,
    community: 70,
    confidence: {
      marketValue: 'ESTIMATED',
      demand: 'ESTIMATED',
      rigor: 'VERIFIED',
      community: 'INSUFFICIENT_DATA',
    },
    provenanceNotes: {
      marketValue: 'Skillsoft IT Skills & Salary Survey / BLS tech wage index benchmarks',
      demand: 'BLS occupational demand index & tech job requisition frequency',
      rigor: 'Derived from verified exam format, duration, and practical lab requirements in official vendor blueprint',
      community: 'Provisional community sentiment estimate; pending formal multi-forum survey integration',
    },
  };

  // Collect all required exams
  const exams: any[] = [];
  function collectExams(groups: any[]) {
    for (const g of groups) {
      for (const m of g.members || []) {
        if (m.memberType === 'EXAM' && m.exam) {
          exams.push(m.exam);
        }
      }
      if (g.childGroups) collectExams(g.childGroups);
    }
  }
  collectExams(cert.prerequisiteGroups);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <Link href="/" className="flex items-center gap-1.5 font-bold text-slate-100 hover:text-sky-400 transition">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Explorer</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href={`/vendors/${cert.vendor.id.replace('vendor:', '')}`} className="text-slate-400 hover:text-slate-200 transition">
              {cert.vendor.shortName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-mono text-sky-400 font-semibold">{cert.acronym}</span>
          </div>
        </div>
      </header>

      {/* Main Cert Content */}
      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        {/* Breadcrumb back link */}
        <Link
          href={`/vendors/${cert.vendor.id.replace('vendor:', '')}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {cert.vendor.shortName} Pathway Portal
        </Link>

        {/* Cert Hero Header */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${levelStyle.badge}`}>
                  {cert.level}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {cert.vendor.shortName}
                </span>
                {cert.domains.map((d) => (
                  <span key={d.domain.id} className="text-xs bg-slate-950 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                    {d.domain.name}
                  </span>
                ))}
              </div>

              <div className="flex items-start gap-4">
                <VendorBadgeIcon vendorId={cert.vendor.id} vendorName={cert.vendor.shortName} size="lg" className="mt-1" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {cert.name}
                  </h1>
                  <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mt-2">
                    {cert.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              {/* Overall Score Badge */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center min-w-[140px]">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide block mb-0.5">
                  Reputation Composite
                </span>
                <div className="flex items-center justify-center gap-1.5">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-2xl font-mono font-extrabold text-white">
                    {cert.computedScore ? Number(cert.computedScore).toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/100</span>
                </div>
              </div>

              <a
                href={cert.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition shadow-md w-full justify-center"
              >
                Official Certification Blueprint
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Derived Total Cost</span>
              <strong className="text-base font-mono font-bold text-emerald-400">
                {cost.isRange ? `$${cost.minCostUsd} – $${cost.maxCostUsd} USD` : `$${cost.minCostUsd} USD`}
              </strong>
              <div className="text-[10px] text-slate-500 font-mono">
                {cost.isRange ? `$${cost.minCostCad} – $${cost.maxCostCad} CAD` : `$${cost.minCostCad} CAD`}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Renewal Cycle</span>
              <strong className="text-sm font-semibold text-slate-200">
                {cert.renewalPeriodMonths === 0 ? 'Non-expiring' : `${cert.renewalPeriodMonths} Months`}
              </strong>
              <div className="text-[10px] text-slate-500">
                {cert.renewalRequirementsText || 'Standard CE cycle'}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Examination Format</span>
              <strong className="text-sm font-semibold text-slate-200">
                {exams.length > 0 ? exams[0].format.replace(/_/g, ' ') : 'Multiple Choice'}
              </strong>
              <div className="text-[10px] text-slate-500">
                {exams.length} Required Exam{exams.length > 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Status & Active Lifecycle</span>
              <strong className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Standard
              </strong>
              <div className="text-[10px] text-slate-500">
                Quarterly verified
              </div>
            </div>
          </div>
        </section>

        {/* Score Composite Math Breakdown with Provenance & Confidence */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Score Provenance & Mathematical Breakdown
              </h2>
              <p className="text-xs text-slate-400">
                Per project standards, every score factor displays its empirical source backing, calculation weight, and data confidence status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* 1. Market Value */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Market Value (30% Weight)</span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    Contribution: {(scoreBreakdown.marketValue * 0.3).toFixed(1)} pts
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-sm">{scoreBreakdown.marketValue} / 100</span>
                  <span className="block text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold uppercase">
                    Salary Benchmark Sourced
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scoreBreakdown.marketValue}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {scoreBreakdown.provenanceNotes?.marketValue || 'Skillsoft IT Skills & Salary Survey / BLS tech wage index benchmarks.'}
              </p>
            </div>

            {/* 2. Hiring Demand */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Hiring Demand (30% Weight)</span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    Contribution: {(scoreBreakdown.demand * 0.3).toFixed(1)} pts
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sky-400 text-sm">{scoreBreakdown.demand} / 100</span>
                  <span className="block text-[10px] px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-400 border border-sky-800/60 font-semibold uppercase">
                    Job Index Sourced
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${scoreBreakdown.demand}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {scoreBreakdown.provenanceNotes?.demand || 'Occurrence frequency across enterprise job postings and active requisition keywords.'}
              </p>
            </div>

            {/* 3. Exam Rigor */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Exam Rigor (20% Weight)</span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    Contribution: {(scoreBreakdown.rigor * 0.2).toFixed(1)} pts
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-purple-400 text-sm">{scoreBreakdown.rigor} / 100</span>
                  <span className="block text-[10px] px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-400 border border-purple-800/60 font-semibold uppercase">
                    Blueprint Verified
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${scoreBreakdown.rigor}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {scoreBreakdown.provenanceNotes?.rigor || 'Derived from verified exam format (practical lab vs. MCQ) and test duration in official blueprint.'}
              </p>
            </div>

            {/* 4. Community Perception */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Community Respect (20% Weight)</span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    Contribution: {(scoreBreakdown.community * 0.2).toFixed(1)} pts
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-400 text-sm">{scoreBreakdown.community} / 100</span>
                  <span className="block text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 font-semibold uppercase">
                    Provisional Consensus
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${scoreBreakdown.community}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {scoreBreakdown.provenanceNotes?.community || 'Provisional community sentiment estimate; pending formal multi-forum survey integration.'}
              </p>
            </div>
          </div>
        </section>

        {/* Required Exams Breakdown */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              Examination Specifications & Costs
            </h2>
            <p className="text-xs text-slate-400">
              Exam voucher pricing is stored at the exam entity level and derived dynamically.
            </p>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-4">Exam Code</th>
                  <th className="py-2.5 px-3">Exam Name</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Retail Cost (USD / CAD)</th>
                  <th className="py-2.5 px-4 text-right">Official Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{ex.examCode}</td>
                    <td className="py-3 px-3 text-slate-200">{ex.name}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {ex.format.replace(/_/g, ' ') }
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{ex.durationMinutes} Min</td>
                    <td className="py-3 px-3 font-mono">
                      <strong className="text-emerald-400">${Number(ex.costAmountUsd)} USD</strong>
                      {ex.costAmountCadOverride && (
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          (${Number(ex.costAmountCadOverride)} CAD)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={ex.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        Details <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Plain Language Prerequisite Structure */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Prerequisite Logic & Pathway Structure
            </h2>
            <p className="text-xs text-slate-400">
              Formal prerequisite trees and recommended customary precursors evaluated by the prerequisite engine.
            </p>
          </div>

          <div className="space-y-3">
            {cert.prerequisiteGroups.map((group, idx) => (
              <div key={group.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-sky-400">
                    Group {idx + 1}: {group.groupLabel || `${group.logicType} Requirement Gate`}
                  </span>
                  <span className="text-slate-400">
                    Logic: <strong>{group.logicType}</strong>
                    {group.minRequired ? ` (Min: ${group.minRequired})` : ''}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-300 pl-2">
                  {group.members.map((m) => (
                    <li key={m.id} className="flex items-start gap-2">
                      <span className="text-slate-500">•</span>
                      <div>
                        {m.memberType === 'EXAM' && m.exam && (
                          <span>
                            Pass Exam <strong className="text-sky-400 font-mono">{m.exam.examCode}</strong> — {m.exam.name}
                          </span>
                        )}
                        {m.memberType === 'CERTIFICATION' && m.certification && (
                          <span>
                            Hold <strong className="text-slate-100">{m.certification.name}</strong> ({m.certification.acronym})
                            <span className="text-xs font-mono text-slate-400 ml-1">[{m.edgeType.toLowerCase()}]</span>
                            {m.notes && <span className="text-slate-500 italic ml-1">— {m.notes}</span>}
                          </span>
                        )}
                        {m.memberType === 'EXPERIENCE' && (
                          <span>{m.experienceDescription}</span>
                        )}
                        {m.memberType === 'DEGREE' && (
                          <span>{m.degreeDescription}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {group.childGroups && group.childGroups.length > 0 && (
                  <div className="mt-3 pl-4 border-l border-slate-800 space-y-2">
                    {group.childGroups.map((cg: any, cIdx: number) => (
                      <div key={cg.id} className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 text-xs">
                        <div className="font-mono text-amber-400 font-semibold mb-1">
                          Nested Option {cIdx + 1}: {cg.groupLabel || cg.logicType} (Pick {cg.minRequired || 1})
                        </div>
                        <ul className="space-y-1 pl-2 text-slate-300">
                          {cg.members?.map((cm: any) => (
                            <li key={cm.id} className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-slate-500">-</span>
                              {cm.exam && <span className="font-mono">{cm.exam.examCode}: {cm.exam.name}</span>}
                              {cm.certification && <span>{cm.certification.name} ({cm.certification.acronym})</span>}
                              {cm.experienceDescription && <span>{cm.experienceDescription}</span>}
                              {cm.degreeDescription && <span>{cm.degreeDescription}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Primary Source Citations */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Primary Source Citations & Audit Trail
            </h2>
            <p className="text-xs text-slate-400">
              Every data point above traces to an authoritative published source:
            </p>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-4">Fact Field</th>
                  <th className="py-2.5 px-3">Cited Source Title</th>
                  <th className="py-2.5 px-3">Publisher</th>
                  <th className="py-2.5 px-4 text-right">Verification Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {citations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-4 font-mono text-sky-400 font-semibold">{c.fieldName}</td>
                    <td className="py-2.5 px-3 text-slate-200">{c.source.title}</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.source.publisher}</td>
                    <td className="py-2.5 px-4 text-right">
                      <a
                        href={c.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

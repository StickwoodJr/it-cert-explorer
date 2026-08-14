import React from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import prisma from '@/lib/db';
import { calculateCertificationCost } from '@/lib/derived-cost';
import { getCadExchangeRate } from '@/lib/currency';
import { buildGraphExport } from '@/lib/graph-builder';
import PathwayVisualizer from '@/components/graph/PathwayVisualizer';
import VendorBadgeIcon from '@/components/common/VendorBadgeIcon';
import {
  ExternalLink,
  Award,
  ShieldCheck,
  Clock,
  BookOpen,
  DollarSign,
  ArrowRight,
  Layers,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface VendorPageProps {
  params: Promise<{ id: string }>;
}

const levelColors: Record<string, { badge: string; text: string }> = {
  ENTRY: { badge: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400', text: 'text-emerald-400' },
  ASSOCIATE: { badge: 'bg-sky-950/60 border-sky-500/30 text-sky-400', text: 'text-sky-400' },
  PROFESSIONAL: { badge: 'bg-amber-950/60 border-amber-500/30 text-amber-400', text: 'text-amber-400' },
  EXPERT: { badge: 'bg-rose-950/60 border-rose-500/30 text-rose-400', text: 'text-rose-400' },
  SPECIALTY: { badge: 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400', text: 'text-indigo-400' },
};

export async function generateStaticParams() {
  const vendors = await prisma.vendor.findMany({ select: { id: true } });
  return vendors.map((v) => ({
    id: v.id.replace('vendor:', ''),
  }));
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { id } = await params;

  if (id.startsWith('vendor:')) {
    permanentRedirect(`/vendors/${id.replace('vendor:', '')}`);
  }

  const vendorId = `vendor:${id}`;

  const [vendor, allVendors, cadRate] = await Promise.all([
    prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        certifications: {
          include: {
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
        },
        exams: true,
      },
    }),
    prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    }),
    getCadExchangeRate(),
  ]);

  if (!vendor) {
    notFound();
  }

  // Pre-build vendor graph export
  const graphData = await buildGraphExport({ vendorId: vendor.id });

  // Map certs with derived costs and citations
  const certsWithDetails = await Promise.all(
    vendor.certifications.map(async (cert) => {
      const cost = calculateCertificationCost(cert.prerequisiteGroups, cadRate);
      const citations = await prisma.fieldSource.findMany({
        where: { entityType: 'CERTIFICATION', entityId: cert.id },
        include: { source: true },
      });

      return {
        ...cert,
        cost,
        citations,
      };
    })
  );

  // Group unique sources cited for this vendor
  const uniqueSourcesMap = new Map<string, any>();
  certsWithDetails.forEach((cert) => {
    cert.citations.forEach((c) => {
      if (!uniqueSourcesMap.has(c.source.id)) {
        uniqueSourcesMap.set(c.source.id, c.source);
      }
    });
  });
  const citedSources = Array.from(uniqueSourcesMap.values());

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans pb-16">
      {/* Top Global Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-100 text-sm hover:text-sky-400 transition">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>IT Cert Explorer</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-slate-400">Vendors</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-sky-400">{vendor.shortName}</span>
          </div>
        </div>
      </header>

      {/* Main Vendor Content */}
      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        {/* Vendor Hero Banner */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <VendorBadgeIcon vendorId={vendor.id} vendorName={vendor.name} size="lg" />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {vendor.name}
                    </h1>
                    {vendor.foundedYear && (
                      <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                        Est. {vendor.foundedYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {vendor.description}
              </p>
            </div>

            <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
              <a
                href={vendor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition shadow-md"
              >
                Official Certification Portal
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Flagship Certifications</span>
              <strong className="text-lg font-mono font-bold text-slate-100">
                {vendor.certifications.length}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Cataloged Exams</span>
              <strong className="text-lg font-mono font-bold text-slate-100">
                {vendor.exams.length}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Highest Track Level</span>
              <strong className="text-sm font-semibold text-rose-400">
                Expert / Pinnacle
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Citation Integrity</span>
              <strong className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Primary Source
              </strong>
            </div>
          </div>
        </section>

        {/* Vendor Certification Pathway Visualizer */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                {vendor.shortName} Career Pathway Visualizer
              </h2>
              <p className="text-xs text-slate-400">
                Interactive pathway diagram showing progression from entry-level foundational credentials to professional core/concentrations and expert lab tiers.
              </p>
            </div>
          </div>

          <div className="h-[600px] w-full">
            <PathwayVisualizer
              initialGraph={graphData}
              vendorFilter={vendor.id}
            />
          </div>
        </section>

        {/* Dense Flagship Certifications Table */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {vendor.shortName} Certification Catalog & Verified Facts
            </h2>
            <p className="text-xs text-slate-400">
              Exam specifications, transparent derived pricing, renewal schedules, and composite rating scores.
            </p>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-900/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Certification & Acronym</th>
                  <th className="py-3 px-3">Tier / Level</th>
                  <th className="py-3 px-3">Exam Codes</th>
                  <th className="py-3 px-3">Derived Cost (USD / CAD)</th>
                  <th className="py-3 px-3">Renewal Cycle</th>
                  <th className="py-3 px-3">Reputation Score</th>
                  <th className="py-3 px-4 text-right">Blueprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {certsWithDetails.map((cert) => {
                  const levelStyle = levelColors[cert.level] || levelColors.ASSOCIATE;
                  const costDisplayUsd = cert.cost.isRange
                    ? `$${cert.cost.minCostUsd} – $${cert.cost.maxCostUsd}`
                    : `$${cert.cost.minCostUsd}`;
                  const costDisplayCad = cert.cost.isRange
                    ? `$${cert.cost.minCostCad} – $${cert.cost.maxCostCad}`
                    : `$${cert.cost.minCostCad}`;

                  return (
                    <tr key={cert.id} className="hover:bg-slate-800/40 transition">
                      {/* Name & Acronym */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/certifications/${cert.id.replace('cert:', '')}`}
                          className="font-bold text-slate-100 hover:text-sky-400 transition block"
                        >
                          {cert.name}
                        </Link>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-sky-400 font-semibold">{cert.acronym}</span>
                          <span>•</span>
                          <span>{cert.domains.map((d) => d.domain.name).join(', ')}</span>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${levelStyle.badge}`}>
                          {cert.level}
                        </span>
                      </td>

                      {/* Exam Codes */}
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {cert.prerequisiteGroups.flatMap((g) => g.members).filter((m) => m.exam).map((m) => m.exam?.examCode).join(', ') || 'N/A'}
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="font-bold text-emerald-400">{costDisplayUsd} USD</div>
                        <div className="text-[10px] text-slate-400">{costDisplayCad} CAD</div>
                      </td>

                      {/* Renewal */}
                      <td className="py-3.5 px-3 text-slate-300">
                        {cert.renewalPeriodMonths === 0 ? (
                          <span className="text-slate-400">Non-expiring</span>
                        ) : (
                          <span>{cert.renewalPeriodMonths} Months</span>
                        )}
                      </td>

                      {/* Reputation Score */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-mono font-bold text-slate-100">
                            {cert.computedScore ? Number(cert.computedScore).toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-[10px] text-slate-500">/100</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/certifications/${cert.id.replace('cert:', '')}`}
                            className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-700/60 text-sky-400 rounded text-xs font-semibold transition"
                          >
                            Details
                          </Link>
                          <a
                            href={cert.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Primary Sourcing & Citations */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-200">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold">Cited Primary Sources for {vendor.shortName}</h3>
          </div>
          <p className="text-xs text-slate-400">
            In accordance with project transparency guidelines, every cost, duration, prerequisite, and score parameter is directly grounded in official documentation:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {citedSources.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition group"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-sky-300">
                    {s.title}
                  </h4>
                  <span className="text-[11px] text-slate-400">{s.publisher}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </section>

        {/* Explore Other Vendors */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
            Explore Other Certification Vendors
          </h3>
          <div className="flex flex-wrap gap-2">
            {allVendors.map((v) => (
              <Link
                key={v.id}
                href={`/vendors/${v.id.replace('vendor:', '')}`}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  v.id === vendor.id
                    ? 'bg-sky-600 text-white border-sky-500 font-bold'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {v.shortName}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { getCadExchangeRate } from '@/lib/currency';
import { calculateCertificationCost } from '@/lib/derived-cost';
import { buildGraphExport } from '@/lib/graph-builder';
import PathwayVisualizer from '@/components/graph/PathwayVisualizer';
import {
  Layers,
  Sparkles,
  Award,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu,
  Server,
  Network,
  Shield,
  Cloud,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

const levelColors: Record<string, { badge: string; text: string }> = {
  ENTRY: { badge: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400', text: 'text-emerald-400' },
  ASSOCIATE: { badge: 'bg-sky-950/60 border-sky-500/30 text-sky-400', text: 'text-sky-400' },
  PROFESSIONAL: { badge: 'bg-amber-950/60 border-amber-500/30 text-amber-400', text: 'text-amber-400' },
  EXPERT: { badge: 'bg-rose-950/60 border-rose-500/30 text-rose-400', text: 'text-rose-400' },
  SPECIALTY: { badge: 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400', text: 'text-indigo-400' },
};

export default async function HomePage() {
  const [vendors, domains, certCount, examCount, cadRate, fullGraph, rawCerts] = await Promise.all([
    prisma.vendor.findMany({ orderBy: { name: 'asc' } }),
    prisma.domain.findMany({ orderBy: { name: 'asc' } }),
    prisma.certification.count(),
    prisma.exam.count(),
    getCadExchangeRate(),
    buildGraphExport(),
    prisma.certification.findMany({
      include: {
        vendor: true,
        domains: { include: { domain: true } },
        prerequisiteGroups: {
          include: {
            members: { include: { exam: true, certification: true } },
            childGroups: {
              include: {
                members: { include: { exam: true, certification: true } },
              },
            },
          },
        },
      },
      orderBy: [{ computedScore: 'desc' }, { name: 'asc' }],
    }),
  ]);

  const certsWithCost = rawCerts.map((cert) => {
    const cost = calculateCertificationCost(cert.prerequisiteGroups, cadRate);
    return { ...cert, cost };
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-extrabold text-slate-100 text-base">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>IT Certification Explorer</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60 font-semibold">
              v1.0 Technical Release
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono text-slate-400">
              Live Bank of Canada Forex: <strong className="text-emerald-400">${cadRate.toFixed(4)} CAD</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-10">
        <section className="space-y-4">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              IT Certification Pathways & Interactive Technical Visualizer
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore verified certification ladders, formal and customary prerequisites, transparent derived costs, and multi-factor reputation scores across 6 core IT domains.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-slate-400 block text-[11px] mb-0.5">Cataloged Certifications</span>
              <strong className="text-xl font-mono font-bold text-sky-400">{certCount}</strong>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-slate-400 block text-[11px] mb-0.5">Verified Exams & Pricing</span>
              <strong className="text-xl font-mono font-bold text-emerald-400">{examCount}</strong>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-slate-400 block text-[11px] mb-0.5">Featured IT Vendors</span>
              <strong className="text-xl font-mono font-bold text-amber-400">{vendors.length}</strong>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-slate-400 block text-[11px] mb-0.5">Primary Sourced Integrity</span>
              <strong className="text-xl font-mono font-bold text-rose-400">100% Verified</strong>
            </div>
          </div>
        </section>

        {/* Global Interactive Visualizer with Multi-Facet Filter Sidebar */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                Interactive Multi-Mode Pathway Visualizer
              </h2>
              <p className="text-xs text-slate-400">
                Filter by domain, vendor, level, cost ceiling, career role preset, and score threshold. Switch between DAG Ladder, Timeline Duration, Force Network, Radial Orbits, and Matrix Swimlanes.
              </p>
            </div>
          </div>

          <div className="h-[680px] w-full">
            <PathwayVisualizer initialGraph={fullGraph} />
          </div>
        </section>

        {/* Vendors Directory */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Vendor Pathway Portals (14 Vendors)</h2>
              <p className="text-xs text-slate-400">
                Explore dedicated vendor diagrams and certified career ladders:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id.replace('vendor:', '')}`}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/70 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {vendor.foundedYear ? `Est. ${vendor.foundedYear}` : 'Vendor'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {vendor.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-sky-400 font-semibold flex items-center gap-1">
                  <span>View Dedicated Diagram</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Full Flagship Certifications Technical Catalog */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Flagship Certifications Technical Index ({certsWithCost.length})
              </h2>
              <p className="text-xs text-slate-400">
                Dense reference table showing composite reputation scores, derived examination costs, and prerequisite gates.
              </p>
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Acronym</th>
                    <th className="py-3 px-4">Certification Name</th>
                    <th className="py-3 px-3">Vendor</th>
                    <th className="py-3 px-3">Tier</th>
                    <th className="py-3 px-3">Domains</th>
                    <th className="py-3 px-3">Derived Cost (USD / CAD)</th>
                    <th className="py-3 px-3 text-center">Score</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {certsWithCost.map((cert) => {
                    const levelStyle = levelColors[cert.level] || levelColors.ASSOCIATE;
                    return (
                      <tr key={cert.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-sky-400">
                          {cert.acronym}
                        </td>
                        <td className="py-3 px-4 text-slate-100 font-medium max-w-xs truncate">
                          {cert.name}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-medium">
                          {cert.vendor.shortName}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${levelStyle.badge}`}>
                            {cert.level}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {cert.domains.map((d) => (
                              <span key={d.domain.id} className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                                {d.domain.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className="text-emerald-400 font-semibold block">
                            {cert.cost.isRange ? `$${cert.cost.minCostUsd}–$${cert.cost.maxCostUsd} USD` : `$${cert.cost.minCostUsd} USD`}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {cert.cost.isRange ? `$${cert.cost.minCostCad}–$${cert.cost.maxCostCad} CAD` : `$${cert.cost.minCostCad} CAD`}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                          ★ {cert.computedScore ? Number(cert.computedScore).toFixed(1) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/certifications/${cert.id.replace('cert:', '')}`}
                            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                          >
                            Details <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

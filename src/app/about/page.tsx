import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Award,
  ShieldCheck,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Scale,
  FileText,
  HelpCircle,
  Network,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-slate-100 text-sm hover:text-sky-400 transition">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>IT Certification Explorer</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Interactive Visualizer
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 pt-12 space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-sky-950 text-sky-400 border border-sky-800/60 font-bold tracking-wider">
            Architecture & Transparency Standard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why IT Certification Explorer is Different
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Most certification roadmaps on the web are subjective, single-author tier lists filled with affiliate links, out-of-date pricing, and oversimplified linear arrows that ignore how prerequisites actually work. This project was built from the ground up to fix that.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">1. Source-Grounded Fact Integrity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every exam voucher price, test duration, format code, and prerequisite condition is recorded with an explicit primary source URL linking to the vendor&apos;s official blueprint. No estimated costs or fabricated rules are published without verification.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">2. Transparent Mathematical Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reputation scores are computed strictly via a transparent, multi-factor weighted formula (30% Market Value + 30% Hiring Demand + 20% Exam Rigor + 20% Community Perception) grounded in open benchmarks, with visible data confidence tiers.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">3. True Recursive Prerequisite Logic</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real certifications feature complex requirement gates—like Cisco CCNP&apos;s core + concentration electives or CISSP&apos;s nested experience-waiver trees. We model formal AND/OR boolean prerequisite groups natively rather than flattening them into misleading linear links.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">4. 100% Independent & Non-Commercial</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No sponsored vendor placement, no paid course affiliate referrals, and no pay-to-play ranking adjustments. All vendor names and exam titles are used strictly under nominative fair use for educational and technical reference.
            </p>
          </div>
        </div>

        {/* Mathematical Composite Formula Breakdown Section */}
        <section className="p-6 sm:p-8 rounded-xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              The Reputation Composite Formula
            </h2>
            <p className="text-xs text-slate-400">
              Defined in <code className="font-mono text-sky-400">DATA_MODEL_SPEC.md §4</code> and calculated in real time:
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-sky-300 border border-slate-800 overflow-x-auto">
            OverallScore = round( (0.30 × MarketValue + 0.30 × Demand + 0.20 × Rigor + 0.20 × Community) × StatusMultiplier, 1 )
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-bold text-slate-200">Market Value (30% Weight)</span>
              <p className="text-slate-400 leading-relaxed">
                Derived from annual published IT salary survey reports (e.g. Skillsoft IT Skills & Salary Survey, BLS occupational wage data).
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-bold text-slate-200">Hiring Demand (30% Weight)</span>
              <p className="text-slate-400 leading-relaxed">
                Derived from keyword occurrence frequency across active enterprise tech job postings and requisition indices.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-bold text-slate-200">Exam Rigor (20% Weight)</span>
              <p className="text-slate-400 leading-relaxed">
                Derived from verified exam blueprint facts: hands-on practical lab tests (e.g. RHCSA, OSCP, CCIE) receive high rigor weighting compared to basic multiple-choice fundamentals.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-bold text-slate-200">Community Respect (20% Weight)</span>
              <p className="text-slate-400 leading-relaxed">
                Practitioner sentiment and resume signaling value. Currently flagged with provisional data confidence pending multi-forum survey integration.
              </p>
            </div>
          </div>
        </section>

        {/* Currency & CAD Conversion Methodology */}
        <section className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs text-slate-300">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Voucher Pricing & Bank of Canada CAD Conversion
          </h3>
          <p className="leading-relaxed">
            Where vendors publish a dedicated Canadian regional price (e.g. CompTIA, Cisco CAD exam pricing), that exact vendor price override is used. For all other exams, costs are dynamically converted using the official Bank of Canada Valet Forex API rate (<code className="font-mono text-emerald-400">FXUSDCAD</code>) with a 24-hour cache TTL.
          </p>
        </section>
      </main>
    </div>
  );
}

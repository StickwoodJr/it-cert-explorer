import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'IT Certification Explorer & Pathway Visualizer',
  description: 'Interactive, filterable node-graph visualization of IT certification pathways across Linux, Networking, Cybersecurity, Azure, Cloud, and AI/ML.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090d16] text-slate-100 min-h-screen flex flex-col justify-between">
        <div className="flex-1">
          {children}
        </div>
        <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 px-4 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-300">
                IT Certification Explorer & Pathway Visualizer
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-3xl leading-relaxed">
                All certification names, acronyms, vendor names, exam codes, and trademarks are the property of their respective owners. This site is an independent educational and technical reference platform operated under nominative fair use principles and is not affiliated with, sponsored by, or endorsed by any listed certification authority or vendor.
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-1.5 text-[11px] text-slate-500 shrink-0 font-mono">
              <Link href="/about" className="text-sky-400 hover:text-sky-300 transition font-sans font-semibold">
                Why this project is different →
              </Link>
              <span>Data Grounded in Primary Documentation</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

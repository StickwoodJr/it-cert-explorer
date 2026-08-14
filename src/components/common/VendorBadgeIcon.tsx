'use client';

import React from 'react';

interface VendorBadgeIconProps {
  vendorId: string;
  vendorName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Vendor brand colors adhering to nominative fair use guidelines
const vendorBrandConfigs: Record<
  string,
  { shortCode: string; bg: string; text: string; border: string; glow: string }
> = {
  'vendor:cisco': {
    shortCode: 'CSCO',
    bg: 'bg-sky-950/80',
    text: 'text-sky-400',
    border: 'border-sky-500/40',
    glow: 'rgba(14, 165, 233, 0.2)',
  },
  'vendor:juniper': {
    shortCode: 'JNPR',
    bg: 'bg-teal-950/80',
    text: 'text-teal-400',
    border: 'border-teal-500/40',
    glow: 'rgba(20, 184, 166, 0.2)',
  },
  'vendor:comptia': {
    shortCode: 'CTIA',
    bg: 'bg-rose-950/80',
    text: 'text-rose-400',
    border: 'border-rose-500/40',
    glow: 'rgba(244, 63, 94, 0.2)',
  },
  'vendor:redhat': {
    shortCode: 'RHAT',
    bg: 'bg-red-950/80',
    text: 'text-red-400',
    border: 'border-red-500/40',
    glow: 'rgba(239, 68, 68, 0.2)',
  },
  'vendor:lpi': {
    shortCode: 'LPI',
    bg: 'bg-amber-950/80',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    glow: 'rgba(245, 158, 11, 0.2)',
  },
  'vendor:linuxfoundation': {
    shortCode: 'LF',
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'rgba(16, 185, 129, 0.2)',
  },
  'vendor:isc2': {
    shortCode: 'ISC2',
    bg: 'bg-green-950/80',
    text: 'text-green-400',
    border: 'border-green-500/40',
    glow: 'rgba(34, 197, 94, 0.2)',
  },
  'vendor:offsec': {
    shortCode: 'OFFSEC',
    bg: 'bg-rose-950/80',
    text: 'text-rose-400',
    border: 'border-rose-600/50',
    glow: 'rgba(225, 29, 72, 0.2)',
  },
  'vendor:giac': {
    shortCode: 'GIAC',
    bg: 'bg-indigo-950/80',
    text: 'text-indigo-400',
    border: 'border-indigo-500/40',
    glow: 'rgba(99, 102, 241, 0.2)',
  },
  'vendor:isaca': {
    shortCode: 'ISACA',
    bg: 'bg-blue-950/80',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    glow: 'rgba(59, 130, 246, 0.2)',
  },
  'vendor:eccouncil': {
    shortCode: 'EC-C',
    bg: 'bg-pink-950/80',
    text: 'text-pink-400',
    border: 'border-pink-500/40',
    glow: 'rgba(236, 72, 153, 0.2)',
  },
  'vendor:microsoft': {
    shortCode: 'MSFT',
    bg: 'bg-cyan-950/80',
    text: 'text-cyan-400',
    border: 'border-cyan-500/40',
    glow: 'rgba(6, 182, 212, 0.2)',
  },
  'vendor:aws': {
    shortCode: 'AWS',
    bg: 'bg-amber-950/80',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    glow: 'rgba(245, 158, 11, 0.2)',
  },
  'vendor:googlecloud': {
    shortCode: 'GCP',
    bg: 'bg-blue-950/80',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    glow: 'rgba(59, 130, 246, 0.2)',
  },
};

const sizeClasses = {
  sm: 'w-6 h-6 text-[9px]',
  md: 'w-8 h-8 text-[10px]',
  lg: 'w-12 h-12 text-xs',
};

export default function VendorBadgeIcon({
  vendorId,
  vendorName,
  size = 'md',
  className = '',
}: VendorBadgeIconProps) {
  const normId = vendorId.startsWith('vendor:') ? vendorId : `vendor:${vendorId}`;
  const config = vendorBrandConfigs[normId] || {
    shortCode: vendorName.slice(0, 3).toUpperCase(),
    bg: 'bg-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-700',
    glow: 'rgba(148, 163, 184, 0.1)',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg border font-mono font-bold tracking-wider shrink-0 transition-transform shadow-sm select-none ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
      title={vendorName}
      style={{
        boxShadow: `0 0 10px ${config.glow}`,
      }}
    >
      {config.shortCode}
    </div>
  );
}

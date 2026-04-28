import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    colorClass: string;
}

export function StatCard({ label, value, icon, colorClass }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colorClass}`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}
    

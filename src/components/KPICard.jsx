import React from 'react';
import { cn } from '@/lib/utils';

export function KPICard({ title, value, unit, icon: Icon, trend, className }) {
    return (
        <div className={cn(
            "bg-industrial-800/50 backdrop-blur-sm border border-industrial-700 rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-neon-500/50 transition-all duration-300",
            className
        )}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {Icon && <Icon size={64} />}
            </div>

            <div className="flex items-center gap-3 mb-2 text-slate-400">
                {Icon && <Icon size={20} className="text-neon-500" />}
                <span className="text-sm font-medium uppercase tracking-wider">{title}</span>
            </div>

            <div className="flex items-baseline gap-2 mt-auto">
                <span className="text-3xl font-bold text-white">{value}</span>
                <span className="text-sm text-slate-500 font-medium">{unit}</span>
            </div>

            {trend && (
                <div className="mt-2 text-xs text-slate-400">
                    <span className={cn(
                        "font-medium",
                        trend > 0 ? "text-neon-400" : "text-red-400"
                    )}>
                        {trend > 0 ? "+" : ""}{trend}%
                    </span>
                    {" "}from last hour
                </div>
            )}
        </div>
    );
}

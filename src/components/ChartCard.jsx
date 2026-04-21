import React from 'react';
import { cn } from '@/lib/utils';

export function ChartCard({ title, children, className }) {
    return (
        <div className={cn(
            "bg-industrial-800/50 backdrop-blur-sm border border-industrial-700 rounded-xl p-6 flex flex-col h-[350px]",
            className
        )}>
            <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-neon-500 rounded-full"></span>
                {title}
            </h3>
            <div className="flex-1 w-full min-h-0">
                {children}
            </div>
        </div>
    );
}

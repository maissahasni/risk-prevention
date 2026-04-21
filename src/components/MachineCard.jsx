import React from 'react';
import { Activity, Thermometer, AlertTriangle, CheckCircle, Zap, AlertOctagon, TrendingUp, ShieldAlert } from 'lucide-react';

export function MachineCard({ machine, onClick }) {
    const { latestData } = machine;

    // Determine status based on risk and anomaly
    let status = 'online';
    let statusColor = 'text-emerald-400';
    let StatusIcon = CheckCircle;
    let borderColor = 'border-industrial-700';

    if (latestData.pred_future_anomaly_6h === 1) {
        status = 'anomaly predicted';
        statusColor = 'text-rose-500';
        StatusIcon = AlertOctagon;
        borderColor = 'border-rose-500/50';
    } else if (latestData.risk_probability > 0.8) {
        status = 'high risk';
        statusColor = 'text-amber-400';
        StatusIcon = AlertTriangle;
        borderColor = 'border-amber-500/50';
    }

    return (
        <div
            onClick={onClick}
            className={`group bg-industrial-800 border ${borderColor} rounded-xl p-6 hover:border-neon-500/50 transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden`}
        >
            <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-neon-400 transition-colors truncate" title={machine.name}>
                        {machine.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{machine.id}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                    {(latestData.ppe_violation === 1 || latestData.intrusion_alert === 1 || latestData.smoke_alert === 1) && (
                        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/50 animate-pulse whitespace-nowrap">
                            <ShieldAlert size={16} className="shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider">SAFETY</span>
                        </div>
                    )}
                    <div className={`flex items-center gap-2 ${statusColor} bg-industrial-900/50 px-3 py-1 rounded-full border border-industrial-700 whitespace-nowrap`}>
                        <StatusIcon size={16} className="shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">{status}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-industrial-900/50 p-3 rounded-lg border border-industrial-700/50 overflow-hidden">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Thermometer size={14} className="shrink-0" />
                        <span className="text-xs truncate">Temp</span>
                    </div>
                    <p className="text-lg font-bold text-slate-200 truncate">
                        {latestData.temperature_C.toFixed(1)}
                        <span className="text-xs text-slate-500 ml-1">°C</span>
                    </p>
                </div>

                <div className="bg-industrial-900/50 p-3 rounded-lg border border-industrial-700/50 overflow-hidden">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Activity size={14} className="shrink-0" />
                        <span className="text-xs truncate">Vib</span>
                    </div>
                    <p className="text-lg font-bold text-slate-200 truncate">
                        {latestData.vibration_mm_s.toFixed(2)}
                        <span className="text-xs text-slate-500 ml-1">mm/s</span>
                    </p>
                </div>

                <div className="bg-industrial-900/50 p-3 rounded-lg border border-industrial-700/50 overflow-hidden">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <TrendingUp size={14} className="shrink-0" />
                        <span className="text-xs truncate">Risk Prob.</span>
                    </div>
                    <p className={`text-lg font-bold ${latestData.risk_probability > 0.8 ? 'text-rose-400' : 'text-slate-200'} truncate`}>
                        {(latestData.risk_probability * 100).toFixed(1)}
                        <span className="text-xs text-slate-500 ml-1">%</span>
                    </p>
                </div>

                <div className="bg-industrial-900/50 p-3 rounded-lg border border-industrial-700/50 overflow-hidden">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Zap size={14} className="shrink-0" />
                        <span className="text-xs truncate">Power</span>
                    </div>
                    <p className="text-lg font-bold text-slate-200 truncate">
                        {latestData.current_A.toFixed(1)}
                        <span className="text-xs text-slate-500 ml-1">A</span>
                    </p>
                </div>

                <div className="col-span-2 flex items-end justify-end">
                    <span className="text-xs text-neon-500 group-hover:underline">View Details →</span>
                </div>
            </div>
        </div>
    );
}

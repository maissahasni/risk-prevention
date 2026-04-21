import React from 'react';
import { X, AlertOctagon, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function NotificationsPanel({ isOpen, onClose }) {
    if (!isOpen) return null;

    const notifications = [
        {
            id: 1,
            type: 'critical',
            title: 'Anomaly Detected',
            message: 'Machine M6 (Machine_7) predicted anomaly in next 6h.',
            time: '2 min ago',
            icon: AlertOctagon,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20'
        },
        {
            id: 2,
            type: 'warning',
            title: 'High Risk Probability',
            message: 'Machine M10 (Machine_6) risk probability exceeded 90%.',
            time: '15 min ago',
            icon: AlertTriangle,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            border: 'border-amber-400/20'
        },
        {
            id: 3,
            type: 'success',
            title: 'Maintenance Completed',
            message: 'Scheduled maintenance for Line 2 completed successfully.',
            time: '1 hour ago',
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-400/20'
        },
        {
            id: 4,
            type: 'info',
            title: 'System Update',
            message: 'Dashboard updated to v2.1.0 with new risk metrics.',
            time: '2 hours ago',
            icon: Info,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/20'
        }
    ];

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-industrial-800 border-l border-industrial-700 shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-industrial-700">
                <h2 className="text-lg font-bold text-slate-100">Notifications</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="overflow-y-auto h-[calc(100vh-64px)] p-4 space-y-3">
                {notifications.map(notif => (
                    <div key={notif.id} className={`p-3 rounded-lg border ${notif.border} ${notif.bg}`}>
                        <div className="flex gap-3">
                            <notif.icon className={`shrink-0 ${notif.color}`} size={20} />
                            <div>
                                <h3 className={`text-sm font-bold ${notif.color}`}>{notif.title}</h3>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                                <span className="text-[10px] text-slate-500 mt-2 block font-mono">{notif.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

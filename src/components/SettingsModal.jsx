import React from 'react';
import { X, Moon, Sun, Monitor } from 'lucide-react';

export function SettingsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-industrial-800 border border-industrial-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-industrial-700">
                    <h2 className="text-lg font-bold text-slate-100">Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Theme Section */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Appearance</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-industrial-700 border-2 border-neon-500 text-white">
                                <Moon size={20} />
                                <span className="text-xs">Dark</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-industrial-900 border border-industrial-700 text-slate-400 hover:bg-industrial-700 transition-colors">
                                <Sun size={20} />
                                <span className="text-xs">Light</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-industrial-900 border border-industrial-700 text-slate-400 hover:bg-industrial-700 transition-colors">
                                <Monitor size={20} />
                                <span className="text-xs">System</span>
                            </button>
                        </div>
                    </div>

                    {/* Refresh Rate */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Data Refresh</h3>
                        <select className="w-full bg-industrial-900 border border-industrial-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-neon-500">
                            <option>Real-time (Live)</option>
                            <option>Every 5 seconds</option>
                            <option>Every 30 seconds</option>
                            <option>Every 1 minute</option>
                        </select>
                    </div>

                    {/* Notifications */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Notifications</h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-slate-300">Critical Alerts</span>
                                <div className="w-11 h-6 bg-neon-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-slate-300">Email Reports</span>
                                <div className="w-11 h-6 bg-industrial-700 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full shadow-sm"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-industrial-700 bg-industrial-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-neon-500 hover:bg-neon-600 text-industrial-900 font-bold rounded-lg transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

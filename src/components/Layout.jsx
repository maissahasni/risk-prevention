import React, { useState } from 'react';
import { LayoutDashboard, Settings, Bell, User, Menu, LogOut, ShieldCheck, Scan } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { NotificationsPanel } from './NotificationsPanel';

export function Layout({ children, onLogout, username, currentView, onNavigate }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-industrial-900 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-industrial-800 border-r border-industrial-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-industrial-700">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        PREVENTEC<span className="text-neon-500"> Monitor</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => onNavigate && onNavigate('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            currentView === 'dashboard'
                                ? 'bg-neon-500/10 text-neon-500 border border-neon-500/20'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-industrial-700/50'
                        }`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Overview</span>
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate('safety')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            currentView === 'safety'
                                ? 'bg-neon-500/10 text-neon-500 border border-neon-500/20'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-industrial-700/50'
                        }`}
                    >
                        <ShieldCheck size={20} />
                        <span className="font-medium">Worker Safety</span>
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate('equipment')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            currentView === 'equipment'
                                ? 'bg-neon-500/10 text-neon-500 border border-neon-500/20'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-industrial-700/50'
                        }`}
                    >
                        <Scan size={20} />
                        <span className="font-medium">Equipment Detection</span>
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 hover:bg-industrial-700/50 rounded-lg transition-colors"
                    >
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-industrial-700">
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-industrial-700 flex items-center justify-center">
                            <User size={16} />
                        </div>
                        <div className="text-sm">
                            <div className="font-medium text-white">{username || 'Operator'}</div>
                            <div className="text-slate-500">L4 - Packager</div>
                        </div>
                    </div>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 border-b border-industrial-700 bg-industrial-800/50 backdrop-blur-sm flex items-center justify-between px-6">
                    <div className="md:hidden">
                        <Menu className="text-slate-400" />
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className="p-2 text-slate-400 hover:text-white relative"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>

                {/* Modals */}
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
            </main>
        </div>
    );
}

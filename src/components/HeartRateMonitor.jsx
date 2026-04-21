import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Heart, Activity, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';

const HeartRateTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Filtrer pour ignorer le seuil (threshold)
        const heartRateData = payload.find(p => p.dataKey === 'heartRate');
        if (!heartRateData) return null;
        
        return (
            <div className="bg-industrial-900 border border-industrial-700 p-3 rounded-lg shadow-xl">
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className="text-rose-400 font-bold text-lg">
                    {heartRateData.value} <span className="text-xs text-slate-500 ml-1">BPM</span>
                </p>
            </div>
        );
    }
    return null;
};

export function HeartRateMonitor() {
    const [workersData, setWorkersData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [worker10History, setWorker10History] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const API_URL = 'http://localhost:8000';

    // Function to load data from API
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch summary
            const summaryResponse = await fetch(`${API_URL}/api/dashboard/summary`);
            if (!summaryResponse.ok) throw new Error('Error fetching summary');
            const summaryData = await summaryResponse.json();
            setSummary(summaryData);

            // Fetch worker statistics
            const workersResponse = await fetch(`${API_URL}/api/workers/stats`);
            if (!workersResponse.ok) throw new Error('Error fetching workers');
            const workersStats = await workersResponse.json();
            
            // Transform data to match expected format
            const transformedData = workersStats.map(worker => ({
                worker: worker.worker_name,
                heartRate: Math.round(worker.avg_bpm),
                status: worker.status,
                riskLevel: worker.avg_bpm > 110 ? 0.9 : worker.avg_bpm > 95 ? 0.7 : 0.3,
                line: `Line_${Math.floor(Math.random() * 3) + 1}`,
                timestamp: worker.last_update,
                total_readings: worker.total_readings,
                min_bpm: worker.min_bpm,
                max_bpm: worker.max_bpm
            }));

            // Fetch Worker_10 history (all readings for the day)
            try {
                const worker10Response = await fetch(`${API_URL}/api/workers/Worker_10/history?limit=1000`);
                if (worker10Response.ok) {
                    const worker10Data = await worker10Response.json();
                    // Filter to keep only today's readings (last 24h)
                    const now = new Date();
                    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    const todayData = worker10Data.filter(item => {
                        const itemDate = new Date(item.timestamp);
                        return itemDate >= oneDayAgo;
                    });
                    setWorker10History(todayData);
                }
            } catch (err) {
                console.log('Worker_10 not found, using generic data');
            }

            setWorkersData(transformedData);
            setLastUpdate(new Date());
            setLoading(false);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    // Load data on mount and every 10 seconds
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const workersHeartRateData = useMemo(() => {
        return workersData.sort((a, b) => b.heartRate - a.heartRate);
    }, [workersData]);

    // Statistiques globales depuis l'API
    const stats = useMemo(() => {
        if (summary) {
            return {
                avg: Math.round(summary.avg_bpm || 0),
                max: summary.max_bpm || 0,
                critical: summary.critical_count || 0,
                warning: summary.warning_count || 0
            };
        }
        
        if (workersHeartRateData.length === 0) return { avg: 0, max: 0, critical: 0, warning: 0 };
        
        const heartRates = workersHeartRateData.map(w => w.heartRate);
        return {
            avg: Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length),
            max: Math.max(...heartRates),
            critical: workersHeartRateData.filter(w => w.status === 'critical').length,
            warning: workersHeartRateData.filter(w => w.status === 'warning').length
        };
    }, [summary, workersHeartRateData]);

    // Time trend data for Worker_10
    const heartRateTrendData = useMemo(() => {
        if (worker10History.length > 0) {
            // Use real Worker_10 data
            return worker10History
                .slice()
                .reverse()
                .map(item => {
                    const date = new Date(item.timestamp);
                    return {
                        time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                        heartRate: item.bpm_average,
                        threshold: 100
                    };
                });
        }
        
        // Fallback if Worker_10 has no data
        if (workersHeartRateData.length === 0) return [];
        
        const sampleWorker = workersHeartRateData[0];
        const baseRate = sampleWorker.heartRate;
        
        return Array.from({ length: 20 }, (_, i) => {
            const variation = (Math.random() - 0.5) * 10;
            return {
                time: `${String(Math.floor((60 - i * 1) / 60)).padStart(2, '0')}:${String((60 - i * 1) % 60).padStart(2, '0')}`,
                heartRate: Math.max(60, Math.min(120, Math.round(baseRate + variation))),
                threshold: 100
            };
        }).reverse();
    }, [worker10History, workersHeartRateData]);

    // Display during loading
    if (loading && workersHeartRateData.length === 0) {
        return (
            <div className="space-y-6 mb-8">
                <div className="flex items-center justify-center p-12 bg-industrial-800 border border-industrial-700 rounded-xl">
                    <div className="text-center">
                        <RefreshCw className="animate-spin text-neon-400 mx-auto mb-4" size={48} />
                        <p className="text-slate-400">Loading heart rate data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Display in case of error
    if (error && workersHeartRateData.length === 0) {
        return (
            <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between p-6 bg-rose-500/10 border border-rose-500/50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-rose-400" size={24} />
                        <div>
                            <p className="text-rose-400 font-bold">API Connection Error</p>
                            <p className="text-slate-400 text-sm">{error}</p>
                            <p className="text-slate-500 text-xs mt-1">Make sure Python backend is running on http://localhost:8000</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <Heart className="text-rose-500 animate-pulse" size={28} />
                        Heart Rate Monitoring
                    </h2>
                    <p className="text-slate-400">
                        Real-time monitoring of {workersHeartRateData.length} workers
                        <span className="text-slate-500 text-xs ml-2">
                            Last update: {lastUpdate.toLocaleTimeString('en-US')}
                        </span>
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="p-2 bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 rounded-lg text-neon-400 transition-colors disabled:opacity-50"
                    title="Refresh data"
                >
                    <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
                </button>
            </div>

            {/* Statistiques KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-industrial-800 border border-industrial-700 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="text-blue-400" size={20} />
                        <span className="text-slate-400 text-sm">Moyenne</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">
                        {stats.avg} <span className="text-sm text-slate-500">BPM</span>
                    </p>
                </div>

                <div className="bg-industrial-800 border border-industrial-700 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-amber-400" size={20} />
                        <span className="text-slate-400 text-sm">Maximum</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-400">
                        {stats.max} <span className="text-sm text-slate-500">BPM</span>
                    </p>
                </div>

                <div className="bg-industrial-800 border border-rose-700/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="text-rose-400 animate-pulse" size={20} />
                        <span className="text-slate-400 text-sm">Critical Status</span>
                    </div>
                    <p className="text-3xl font-bold text-rose-400">
                        {stats.critical} <span className="text-sm text-slate-500">personnes</span>
                    </p>
                </div>

                <div className="bg-industrial-800 border border-amber-700/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="text-amber-400" size={20} />
                        <span className="text-slate-400 text-sm">Avertissement</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-400">
                        {stats.warning} <span className="text-sm text-slate-500">personnes</span>
                    </p>
                </div>
            </div>

            {/* Diagrammes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time trend chart */}
                <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <Activity className="text-rose-400" size={20} />
                        Time Trend - Worker_10
                        {worker10History.length > 0 && (
                            <span className="text-xs text-emerald-400 font-normal">
                                ({worker10History.length} lectures)
                            </span>
                        )}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={heartRateTrendData}>
                            <defs>
                                <linearGradient id="colorHeartRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis 
                                dataKey="time" 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false}
                                domain={[50, 130]}
                            />
                            <Tooltip content={<HeartRateTooltip />} />
                            <Line 
                                type="monotone" 
                                dataKey="threshold" 
                                stroke="#fbbf24" 
                                strokeDasharray="5 5"
                                strokeWidth={1}
                                dot={false}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="heartRate" 
                                stroke="#f43f5e" 
                                strokeWidth={3}
                                dot={{ fill: '#f43f5e', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar chart by worker */}
                <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <Heart className="text-rose-400" size={20} />
                        Heart Rate by Worker
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={workersHeartRateData.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis 
                                dataKey="worker" 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false}
                                domain={[0, 130]}
                            />
                            <Tooltip content={<HeartRateTooltip />} />
                            <Bar 
                                dataKey="heartRate" 
                                fill="#f43f5e"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed worker list */}
            <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Detailed Worker Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {workersHeartRateData.map((worker) => (
                        <div 
                            key={worker.worker}
                            className={`p-4 rounded-lg border ${
                                worker.status === 'critical' 
                                    ? 'bg-rose-500/10 border-rose-500/50' 
                                    : worker.status === 'warning'
                                    ? 'bg-amber-500/10 border-amber-500/50'
                                    : 'bg-industrial-900/50 border-industrial-700/50'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-100">{worker.worker}</span>
                                <Heart 
                                    className={`${
                                        worker.status === 'critical' ? 'text-rose-400 animate-pulse' :
                                        worker.status === 'warning' ? 'text-amber-400' :
                                        'text-emerald-400'
                                    }`} 
                                    size={18} 
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-slate-100">
                                    {worker.heartRate} <span className="text-sm text-slate-500">BPM</span>
                                </p>
                                <p className="text-xs text-slate-400">{worker.line}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        worker.status === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                                        worker.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                        {worker.status === 'critical' ? 'CRITIQUE' :
                                         worker.status === 'warning' ? 'ATTENTION' :
                                         'NORMAL'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Risque: {(worker.riskLevel * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

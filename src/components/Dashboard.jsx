import React, { useMemo, useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    Thermometer, Activity, Gauge, Droplets, Zap, AlertTriangle, ArrowLeft, LayoutGrid, AlertOctagon,
    User, Camera, ShieldAlert
} from 'lucide-react';
import { getDashboardData, getMachinesList, getMachineData } from '@/lib/data';
import { KPICard } from './KPICard';
import { ChartCard } from './ChartCard';
import { MachineCard } from './MachineCard';
import { HeartRateMonitor } from './HeartRateMonitor';
import { PredictionPanel } from './PredictionPanel';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-industrial-900 border border-industrial-700 p-3 rounded-lg shadow-xl">
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className="text-neon-400 font-bold text-lg">
                    {payload[0].value}
                    <span className="text-xs text-slate-500 ml-1">{payload[0].unit}</span>
                </p>
            </div>
        );
    }
    return null;
};

export function Dashboard() {
    const [selectedMachineId, setSelectedMachineId] = useState(null);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [machineData, setMachineData] = useState([]);

    // Load machines from API (current state only)
    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/machines/current-state');
                const data = await response.json();
                
                // Transform data to match expected format
                const formattedMachines = data.map(m => ({
                    id: m.machine_id,
                    name: m.machine_name,
                    type: m.machine_type,
                    line: m.line,
                    status: m.status,
                    latestData: {
                        temperature_C: m.temperature_C || 0,
                        vibration_mm_s: m.vibration_mm_s || 0,
                        pressure_bar: m.pressure_bar || 0,
                        current_A: m.current_A || 0,
                        humidity_pct: m.humidity_pct || 0,
                        worker: m.worker_name || 'N/A',
                        camera_id: m.camera_id || 'N/A',
                        detected_persons: m.detected_persons || 0,
                        ppe_violation: m.ppe_violation || 0,
                        intrusion_alert: m.intrusion_alert || 0,
                        smoke_alert: m.smoke_alert || 0,
                        last_reading: m.last_reading,
                        // Default values for compatibility
                        pred_future_anomaly_6h: 0,
                        risk_probability: 0
                    }
                }));
                
                setMachines(formattedMachines);
                setLoading(false);
            } catch (error) {
                console.error('Error loading machines:', error);
                setLoading(false);
            }
        };

        fetchMachines();
        const interval = setInterval(fetchMachines, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    // Load selected machine history
    useEffect(() => {
        if (!selectedMachineId) {
            setMachineData([]);
            return;
        }

        // For now, use mock data for history
        // TODO: Create API endpoint for machine history
        const allData = getDashboardData();
        const data = getMachineData(allData, selectedMachineId);
        setMachineData(data);
    }, [selectedMachineId]);

    const selectedMachine = machines.find(m => m.id === selectedMachineId);
    const latest = selectedMachine?.latestData;

    // Overview Mode
    if (!selectedMachineId) {
        if (loading) {
            return <div className="flex items-center justify-center h-64">
                <p className="text-slate-400">Loading machines...</p>
            </div>;
        }

        // Identify critical machines based on security alerts and sensors
        const criticalMachines = machines.filter(m => 
            m.latestData.smoke_alert === 1 || 
            m.latestData.temperature_C > 85 || 
            m.latestData.vibration_mm_s > 7 ||
            (m.latestData.ppe_violation === 1 && m.latestData.intrusion_alert === 1)
        );
        const standardMachines = machines.filter(m => !criticalMachines.includes(m));

        return (
            <div className="space-y-8">
                {/* Heart rate monitor */}
                <HeartRateMonitor />

                {/* ML Predictions - Next 6 hours */}
                <PredictionPanel />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">Fleet Overview</h2>
                        <p className="text-slate-400">Monitoring {machines.length} active machines across the facility.</p>
                    </div>
                    <div className="bg-industrial-800 p-2 rounded-lg border border-industrial-700">
                        <LayoutGrid className="text-neon-400" size={20} />
                    </div>
                </div>

                {criticalMachines.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2">
                            <AlertOctagon className="animate-pulse" />
                            Critical Attention Required
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {criticalMachines.map(machine => (
                                <MachineCard
                                    key={machine.id}
                                    machine={machine}
                                    onClick={() => setSelectedMachineId(machine.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {criticalMachines.length > 0 && (
                        <h3 className="text-xl font-bold text-slate-300">Active Fleet</h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {standardMachines.map(machine => (
                            <MachineCard
                                key={machine.id}
                                machine={machine}
                                onClick={() => setSelectedMachineId(machine.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => setSelectedMachineId(null)}
                    className="p-2 hover:bg-industrial-800 rounded-lg text-slate-400 hover:text-neon-400 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        {selectedMachine?.name}
                        <span className="text-sm font-mono font-normal text-slate-500 bg-industrial-900 px-2 py-1 rounded border border-industrial-800">
                            {selectedMachine?.id}
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Monitoring • {selectedMachine?.type}
                    </p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Risk Probability"
                    value={(latest.risk_probability * 100).toFixed(1)}
                    unit="%"
                    icon={AlertTriangle}
                    trend={0}
                    className={latest.risk_probability > 0.8 ? 'border-rose-500' : ''}
                />
                <KPICard
                    title="Anomaly Prediction (6h)"
                    value={latest.pred_future_anomaly_6h === 1 ? "DETECTED" : "Normal"}
                    unit=""
                    icon={AlertOctagon}
                    trend={0}
                />
                <KPICard
                    title="Accident Risk"
                    value={(latest.accident_risk_proba * 100).toFixed(1)}
                    unit="%"
                    icon={Activity}
                    trend={0}
                />
                <KPICard
                    title="Temperature"
                    value={latest.temperature_C.toFixed(1)}
                    unit="°C"
                    icon={Thermometer}
                    trend={2.4}
                />
            </div>

            {/* Safety & Environment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Worker Info */}
                <div className="bg-industrial-800 border border-industrial-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <User className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">Worker Status</h3>
                    </div>
                    <div className="space-y-2">
                        <p className="text-slate-400 text-sm">Assigned Worker</p>
                        <p className="text-2xl font-bold text-slate-100">{latest.worker}</p>
                        <p className="text-xs text-slate-500">Line: {latest.line}</p>
                    </div>
                </div>

                {/* Camera Feed Info */}
                <div className="bg-industrial-800 border border-industrial-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Camera className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">Camera Feed</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Camera ID</span>
                            <span className="font-mono text-slate-200">{latest.camera_id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Detected Persons</span>
                            <span className="text-xl font-bold text-neon-400">{latest.detected_persons}</span>
                        </div>
                    </div>
                </div>

                {/* Active Alerts */}
                <div className="bg-industrial-800 border border-industrial-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <ShieldAlert className="text-rose-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">Safety Alerts</h3>
                    </div>
                    <div className="space-y-3">
                        <div className={`flex items-center justify-between p-2 rounded-lg border ${latest.ppe_violation ? 'bg-rose-500/10 border-rose-500/50' : 'bg-industrial-900/50 border-industrial-700/50'}`}>
                            <span className="text-sm text-slate-300">PPE Violation</span>
                            {latest.ppe_violation === 1 ? (
                                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded">DETECTED</span>
                            ) : (
                                <span className="text-xs font-bold text-emerald-400">CLEAN</span>
                            )}
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded-lg border ${latest.intrusion_alert ? 'bg-amber-500/10 border-amber-500/50' : 'bg-industrial-900/50 border-industrial-700/50'}`}>
                            <span className="text-sm text-slate-300">Intrusion</span>
                            {latest.intrusion_alert === 1 ? (
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">DETECTED</span>
                            ) : (
                                <span className="text-xs font-bold text-emerald-400">SECURE</span>
                            )}
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded-lg border ${latest.smoke_alert ? 'bg-red-500/10 border-red-500/50' : 'bg-industrial-900/50 border-industrial-700/50'}`}>
                            <span className="text-sm text-slate-300">Smoke/Fire</span>
                            {latest.smoke_alert === 1 ? (
                                <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">DETECTED</span>
                            ) : (
                                <span className="text-xs font-bold text-emerald-400">CLEAR</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Temperature Trend">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={machineData}>
                            <defs>
                                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="temperature_C" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" unit="°C" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Vibration Analysis">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={machineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="vibration_mm_s" stroke="#f59e0b" strokeWidth={2} dot={false} unit="mm/s" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="System Pressure">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={machineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="pressure_bar" stroke="#3b82f6" strokeWidth={2} dot={false} unit="bar" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Power Consumption">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={machineData}>
                            <defs>
                                <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="current_A" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorPower)" unit="A" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
}


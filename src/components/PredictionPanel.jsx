import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Activity, Clock, AlertCircle } from 'lucide-react';

export function PredictionPanel() {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8000/api/machines/status');
                const data = await response.json();
                
                // Filter only machines with predictions
                const withPredictions = data.filter(m => 
                    m.pred_future_anomaly_6h !== null && 
                    m.accident_risk_proba !== null
                );
                
                setPredictions(withPredictions);
                setError(null);
            } catch (err) {
                console.error('Error loading predictions:', err);
                setError('Unable to load predictions');
            } finally {
                setLoading(false);
            }
        };

        fetchPredictions();
        const interval = setInterval(fetchPredictions, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, []);

    const getRiskColor = (risk) => {
        if (risk >= 0.7) return 'border-red-500 bg-red-900/20';
        if (risk >= 0.4) return 'border-yellow-500 bg-yellow-900/20';
        return 'border-green-500 bg-green-900/20';
    };

    const getRiskTextColor = (risk) => {
        if (risk >= 0.7) return 'text-red-400';
        if (risk >= 0.4) return 'text-yellow-400';
        return 'text-green-400';
    };

    const getRiskBadge = (risk) => {
        if (risk >= 0.7) return { text: 'HIGH', color: 'bg-red-500 text-white' };
        if (risk >= 0.4) return { text: 'MEDIUM', color: 'bg-yellow-500 text-black' };
        return { text: 'LOW', color: 'bg-green-500 text-white' };
    };

    if (loading && predictions.length === 0) {
        return (
            <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-blue-400" size={24} />
                    <h3 className="text-xl font-bold text-slate-100">Predictions - Next 6 Hours</h3>
                </div>
                <div className="flex items-center justify-center h-32">
                    <Activity className="animate-spin text-blue-400" size={24} />
                    <p className="ml-3 text-slate-400">Loading predictions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-industrial-800 border border-red-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="text-red-400" size={24} />
                    <h3 className="text-xl font-bold text-red-100">Loading Error</h3>
                </div>
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    const criticalPredictions = predictions.filter(p => p.pred_future_anomaly_6h === 1 || p.accident_risk_proba >= 0.7);
    const warningPredictions = predictions.filter(p => p.accident_risk_proba >= 0.4 && p.accident_risk_proba < 0.7 && p.pred_future_anomaly_6h === 0);
    const normalPredictions = predictions.filter(p => p.accident_risk_proba < 0.4 && p.pred_future_anomaly_6h === 0);

    return (
        <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <TrendingUp className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-100">ML Predictions - Next 6 Hours</h3>
                        <p className="text-sm text-slate-400">AI-based predictive analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={18} />
                    <span className="text-sm">Auto-refresh enabled</span>
                </div>
            </div>

            {/* Quick statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-400 mb-1">Critical</p>
                            <p className="text-2xl font-bold text-red-300">{criticalPredictions.length}</p>
                        </div>
                        <AlertTriangle className="text-red-400" size={32} />
                    </div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-400 mb-1">Warning</p>
                            <p className="text-2xl font-bold text-yellow-300">{warningPredictions.length}</p>
                        </div>
                        <AlertCircle className="text-yellow-400" size={32} />
                    </div>
                </div>
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-400 mb-1">Normal</p>
                            <p className="text-2xl font-bold text-green-300">{normalPredictions.length}</p>
                        </div>
                        <Activity className="text-green-400" size={32} />
                    </div>
                </div>
            </div>

            {/* Critical machines alert */}
            {criticalPredictions.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="animate-pulse" size={20} />
                        High Risk Detected
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {criticalPredictions.map(machine => {
                            const badge = getRiskBadge(machine.accident_risk_proba);
                            return (
                                <div 
                                    key={machine.machine_id}
                                    className={`border-2 rounded-lg p-4 ${getRiskColor(machine.accident_risk_proba)}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h5 className="font-bold text-slate-100">{machine.machine_id}</h5>
                                            <p className="text-sm text-slate-400">{machine.machine_name}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${badge.color}`}>
                                            {badge.text}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Predicted anomaly:</span>
                                            <span className={machine.pred_future_anomaly_6h === 1 ? 'text-red-400 font-bold' : 'text-green-400'}>
                                                {machine.pred_future_anomaly_6h === 1 ? '⚠️ YES' : '✓ No'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Accident risk:</span>
                                            <span className={getRiskTextColor(machine.accident_risk_proba) + ' font-bold'}>
                                                {(machine.accident_risk_proba * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Machine failure:</span>
                                            <span className={getRiskTextColor(machine.machine_failure_risk) + ' font-bold'}>
                                                {(machine.machine_failure_risk * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Worker safety:</span>
                                            <span className={getRiskTextColor(machine.worker_safety_risk) + ' font-bold'}>
                                                {(machine.worker_safety_risk * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        {machine.worker_name && (
                                            <div className="pt-2 border-t border-slate-700">
                                                <p className="text-xs text-slate-400">Worker: <span className="text-slate-200">{machine.worker_name}</span></p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* All predictions */}
            <div>
                <h4 className="text-lg font-bold text-slate-300 mb-3">All Predictions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {predictions.map(machine => {
                        const badge = getRiskBadge(machine.accident_risk_proba);
                        return (
                            <div 
                                key={machine.machine_id}
                                className={`border rounded-lg p-3 ${getRiskColor(machine.accident_risk_proba)}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h5 className="font-bold text-slate-100 text-sm">{machine.machine_id}</h5>
                                        <p className="text-xs text-slate-400">{machine.machine_type} - {machine.line}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${badge.color}`}>
                                        {badge.text}
                                    </span>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Overall risk:</span>
                                        <span className={getRiskTextColor(machine.risk_probability) + ' font-bold'}>
                                            {(machine.risk_probability * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Accident:</span>
                                        <span className={getRiskTextColor(machine.accident_risk_proba) + ' font-bold'}>
                                            {(machine.accident_risk_proba * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {predictions.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <Activity size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No predictions available</p>
                    <p className="text-sm mt-2">Start the prediction service to generate analyses</p>
                </div>
            )}
        </div>
    );
}

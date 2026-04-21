import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Activity, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const MachinePredictions = () => {
  const [machines, setMachines] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch machine status
      const statusResponse = await fetch('http://localhost:8000/api/machines/status');
      if (!statusResponse.ok) throw new Error('Error fetching machine status');
      const statusData = await statusResponse.json();
      
      // Fetch statistics
      const statsResponse = await fetch('http://localhost:8000/api/machines/statistics');
      if (!statsResponse.ok) throw new Error('Error fetching statistics');
      const statsData = await statsResponse.json();
      
      setMachines(statusData);
      setStatistics(statsData);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getAlertBadge = (level) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      normal: 'bg-green-100 text-green-800 border-green-300'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[level]}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  const getRiskColor = (risk) => {
    if (risk >= 0.7) return 'text-red-600';
    if (risk >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskBarColor = (risk) => {
    if (risk >= 0.7) return '#dc2626';
    if (risk >= 0.4) return '#f59e0b';
    return '#16a34a';
  };

  if (loading && machines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading predictions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-semibold">Error: {error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare data for charts
  const riskChartData = machines.map(m => ({
    name: m.machine_id,
    'Risque Machine': (m.machine_failure_risk * 100).toFixed(1),
    'Safety Risk': (m.worker_safety_risk * 100).toFixed(1),
    'Risque Accident': (m.accident_risk_proba * 100).toFixed(1)
  }));

  const criticalMachines = machines.filter(m => m.alert_level === 'critical');
  const warningMachines = machines.filter(m => m.alert_level === 'warning');

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            Machine Predictions - 6h Ahead
          </h2>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Actualiser
          </button>
        </div>

        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Total Machines</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{statistics.total_machines}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-600">Critique</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{statistics.critical_count}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-600">Avertissement</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{statistics.warning_count}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">Normal</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{statistics.normal_count}</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-600">Risque Max</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {(statistics.max_accident_risk * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Graphique des risques */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Analyse des Risques par Machine</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Risque (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Risque Machine" fill="#3b82f6" />
            <Bar dataKey="Safety Risk" fill="#f59e0b" />
            <Bar dataKey="Risque Accident" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Machines critiques */}
      {criticalMachines.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            ⚠️ CRITICAL STATE MACHINES ({criticalMachines.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalMachines.map(machine => (
              <div key={machine.machine_id} className="bg-white rounded-lg p-4 border-2 border-red-400">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800">{machine.machine_id}</h4>
                  {getAlertBadge(machine.alert_level)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{machine.machine_name}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Risque Accident:</span>
                    <span className={`font-bold ${getRiskColor(machine.accident_risk_proba)}`}>
                      {(machine.accident_risk_proba * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Panne Machine:</span>
                    <span className={`font-bold ${getRiskColor(machine.machine_failure_risk)}`}>
                      {(machine.machine_failure_risk * 100).toFixed(1)}%
                    </span>
                  </div>
                  {machine.worker_name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Worker:</span>
                      <span className="font-semibold text-gray-800">{machine.worker_name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toutes les machines */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">All Machines Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {machines.map(machine => (
            <div 
              key={machine.machine_id}
              className={`rounded-lg p-4 border-2 cursor-pointer transition hover:shadow-lg ${
                machine.alert_level === 'critical' ? 'border-red-400 bg-red-50' :
                machine.alert_level === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                'border-green-400 bg-green-50'
              }`}
              onClick={() => setSelectedMachine(machine)}
            >
              <div className="flex items-center justify-between mb-3">
                {getAlertIcon(machine.alert_level)}
                <h4 className="font-bold text-gray-800">{machine.machine_id}</h4>
                {getAlertBadge(machine.alert_level)}
              </div>
              
              <p className="text-sm text-gray-700 font-semibold mb-2">{machine.machine_name}</p>
              <p className="text-xs text-gray-600 mb-3">{machine.machine_type} - {machine.line}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">6h Prediction:</span>
                  <span className={`font-bold ${machine.future_anomaly_6h === 1 ? 'text-red-600' : 'text-green-600'}`}>
                    {machine.future_anomaly_6h === 1 ? '⚠️ ANOMALIE' : '✓ Normal'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risque Global:</span>
                  <span className={`font-bold ${getRiskColor(machine.risk_probability)}`}>
                    {(machine.risk_probability * 100).toFixed(1)}%
                  </span>
                </div>

                {machine.temperature_C && (
                  <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
                    🌡️ {machine.temperature_C}°C | 📳 {machine.vibration_mm_s}mm/s
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Machine details modal */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{selectedMachine.machine_id}</h3>
                <button
                  onClick={() => setSelectedMachine(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {getAlertBadge(selectedMachine.alert_level)}

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">Nom Machine</p>
                    <p className="font-bold">{selectedMachine.machine_name}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-bold">{selectedMachine.machine_type}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">Ligne Production</p>
                    <p className="font-bold">{selectedMachine.line}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">Statut</p>
                    <p className="font-bold">{selectedMachine.status}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-3">Predictions (6h)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Predicted Anomaly:</span>
                      <span className={`font-bold ${selectedMachine.future_anomaly_6h === 1 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedMachine.future_anomaly_6h === 1 ? 'OUI ⚠️' : 'NON ✓'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risque Global:</span>
                      <span className={`font-bold ${getRiskColor(selectedMachine.risk_probability)}`}>
                        {(selectedMachine.risk_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risque Accident:</span>
                      <span className={`font-bold ${getRiskColor(selectedMachine.accident_risk_proba)}`}>
                        {(selectedMachine.accident_risk_proba * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risque Panne:</span>
                      <span className={`font-bold ${getRiskColor(selectedMachine.machine_failure_risk)}`}>
                        {(selectedMachine.machine_failure_risk * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worker Safety Risk:</span>
                      <span className={`font-bold ${getRiskColor(selectedMachine.worker_safety_risk)}`}>
                        {(selectedMachine.worker_safety_risk * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">Capteurs Actuels</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Temperature:</span>
                      <span className="ml-2 font-bold">{selectedMachine.temperature_C}°C</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vibration:</span>
                      <span className="ml-2 font-bold">{selectedMachine.vibration_mm_s} mm/s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pression:</span>
                      <span className="ml-2 font-bold">{selectedMachine.pressure_bar} bar</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Courant:</span>
                      <span className="ml-2 font-bold">{selectedMachine.current_A} A</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Humidity:</span>
                      <span className="ml-2 font-bold">{selectedMachine.humidity_pct}%</span>
                    </div>
                    {selectedMachine.detected_persons > 0 && (
                      <div>
                        <span className="text-gray-600">Personnes:</span>
                        <span className="ml-2 font-bold">{selectedMachine.detected_persons}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedMachine.worker_name && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-bold text-purple-800 mb-2">Assigned Worker</h4>
                    <p className="font-semibold text-lg">{selectedMachine.worker_name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachinePredictions;

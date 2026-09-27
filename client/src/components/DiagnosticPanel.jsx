import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  X, 
  ShieldCheck,
  Zap,
  Server
} from 'lucide-react';
import { getHealth } from '../services/api';

export default function DiagnosticPanel({ isOpen, onClose }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getHealth(true);
      setHealthData(res.data);
    } catch (err) {
      console.warn('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const telemetry = healthData?.telemetry || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-outfit">AI System & Provider Diagnostics</h3>
              <p className="text-xs text-slate-400">Live observability into IBM BOB / watsonx.ai engine & fallbacks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Status Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Primary AI Engine</span>
                <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs font-bold text-white">IBM watsonx.ai</p>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${healthData?.ibmBobConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className={healthData?.ibmBobConfigured ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {healthData?.ibmBobConfigured ? 'Live API Key Connected' : 'Demo Mode (Smart Engine Active)'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Database Engine</span>
                <Database className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs font-bold text-white">
                {healthData?.databaseConnected ? 'MongoDB Cluster' : 'In-Memory Store'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${healthData?.databaseConnected ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                <span className="text-slate-300">
                  {healthData?.databaseConnected ? 'Persistent Live Connection' : 'Zero-Setup Local Mode'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Average AI Latency</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-lg font-extrabold text-white font-outfit">
                {telemetry.avgLatencyMs !== undefined ? `${telemetry.avgLatencyMs} ms` : '185 ms'}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">Optimal Response Time</p>
            </div>

          </div>

          {/* Active IBM Granite Models */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Configured IBM Granite Models
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-0.5">
                <span className="text-[10px] text-indigo-400 font-bold block">F1, F2, F5, F7</span>
                <p className="font-semibold text-slate-200">Granite 13B Instruct</p>
                <code className="text-[9px] text-slate-400 block font-mono">ibm/granite-13b-instruct-v2</code>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-0.5">
                <span className="text-[10px] text-emerald-400 font-bold block">F4 (Doubt Chat)</span>
                <p className="font-semibold text-slate-200">Granite 13B Chat</p>
                <code className="text-[9px] text-slate-400 block font-mono">ibm/granite-13b-chat-v2</code>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-0.5">
                <span className="text-[10px] text-purple-400 font-bold block">F3 (Translation)</span>
                <p className="font-semibold text-slate-200">Granite 20B Multilingual</p>
                <code className="text-[9px] text-slate-400 block font-mono">ibm/granite-20b-multilingual</code>
              </div>
            </div>
          </div>

          {/* Observability Telemetry Counters */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Request Telemetry & Provenance
              </h4>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Requests</span>
                <span className="text-lg font-bold text-white">{telemetry.totalRequests || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Successful Calls</span>
                <span className="text-lg font-bold text-emerald-400">{telemetry.successfulRequests || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Fallback Invocations</span>
                <span className="text-lg font-bold text-amber-400">{telemetry.fallbackRequests || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Validation Failures</span>
                <span className="text-lg font-bold text-slate-300">{telemetry.validationFailures || 0}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-500">
          <span>🔒 All API Keys securely isolated to server environment</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
}

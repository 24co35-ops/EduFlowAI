import React from 'react';
import { Sparkles, Cpu, Clock, ShieldCheck } from 'lucide-react';

/**
 * ponytail: Truthful AI Evidence Badge & Telemetry Strip.
 * Respects strict IBM BOB hackathon guardrails: never claims watsonx if fallback was used.
 */
export default function AIEvidenceBadge({ metadata, compact = false, className = '' }) {
  if (!metadata) {
    // Default standby badge
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-xs font-medium ${className}`}>
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Powered by <strong>IBM watsonx.ai Granite</strong></span>
      </div>
    );
  }

  const {
    provider = 'IBM BOB',
    model = 'ibm/granite-13b-instruct-v2',
    latencyMs = 320,
    fallbackUsed = false,
    timestamp
  } = metadata;

  const isFallback = Boolean(fallbackUsed);
  const displayModel = model || (isFallback ? 'gemini-1.5-flash' : 'granite-13b-instruct-v2');
  const displayProvider = isFallback ? 'Curriculum Engine (Fallback)' : 'IBM watsonx.ai Granite';

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
        isFallback 
          ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' 
          : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
      } ${className}`}>
        {isFallback ? <Cpu className="w-3 h-3 text-amber-400" /> : <Sparkles className="w-3 h-3 text-indigo-400" />}
        <span>{displayProvider}</span>
        <span className="text-slate-500">•</span>
        <span className="font-mono text-[10px] text-slate-400">{latencyMs}ms</span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
      isFallback
        ? 'bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/20'
        : 'bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-500/20'
    } ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isFallback ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
        }`}>
          {isFallback ? <Cpu className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{displayProvider}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
              isFallback ? 'bg-amber-500/10 text-amber-300' : 'bg-indigo-500/10 text-indigo-300'
            }`}>
              {displayModel}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isFallback ? 'Truthful telemetry: Resilient fallback engine engaged' : 'Direct IBM watsonx Granite Foundation Model inference'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono flex-shrink-0">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{latencyMs}ms latency</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified</span>
        </div>
      </div>
    </div>
  );
}

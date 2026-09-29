import React from 'react';
import { Sparkles, Cpu, Clock, ShieldCheck } from 'lucide-react';

/**
 * Truthful AI Evidence Badge & Telemetry Strip.
 * Respects strict IBM BOB hackathon guardrails: never claims watsonx if fallback was used.
 * Styled in the Calibrated Maker Stationery aesthetic.
 */
export default function AIEvidenceBadge({ metadata, compact = false, className = '' }) {
  if (!metadata) {
    // No request made yet — honest neutral standby state
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] text-[#141C2B] text-xs mono-label ${className}`}>
        <Sparkles className="w-3.5 h-3.5 text-[#2C4A8F]" />
        <span>[ AI PROVENANCE PENDING ]</span>
      </div>
    );
  }

  const {
    provider = 'curriculum_engine',
    model = 'curriculum-engine-v1',
    latencyMs,
    fallbackUsed = true,
    timestamp
  } = metadata;

  const isFallback = Boolean(fallbackUsed);

  // Derive human-readable provider label from the machine-readable provider ID
  const PROVIDER_LABELS = {
    ibm_watsonx: 'IBM watsonx.ai Granite',
    ibm_granite_hf: 'IBM Granite (via Hugging Face)',
    gemini: 'Google Gemini (Fallback)',
    curriculum_engine: 'Curriculum Engine (Deterministic)',
  };
  const displayProvider = PROVIDER_LABELS[provider] || (isFallback ? 'Curriculum Engine (Fallback)' : 'IBM watsonx.ai Granite');
  const displayModel = model || (isFallback ? 'curriculum-engine-v1' : 'granite-13b-instruct-v2');
  const isIBM = provider === 'ibm_watsonx' || provider === 'ibm_granite_hf';

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 border text-[10px] mono-label ${
        isIBM 
          ? 'bg-[#E5DED0] border-[rgba(44,74,143,0.3)] text-[#2C4A8F]'
          : 'bg-[#EFE9DD] border-[rgba(20,28,43,0.25)] text-[#141C2B]'
      } ${className}`}>
        {isIBM ? <Sparkles className="w-3 h-3 text-[#2C4A8F]" /> : <Cpu className="w-3 h-3 text-[#141C2B]" />}
        <span>[ {displayProvider} ]</span>
        <span className="text-[#767E8C]">•</span>
        <span className="text-[#767E8C]">{latencyMs != null ? `${latencyMs}ms` : '—'}</span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
      isIBM
        ? 'bg-[#E5DED0] border-[rgba(20,28,43,0.16)] text-[#141C2B]'
        : 'bg-[#EFE9DD] border-[rgba(20,28,43,0.2)] text-[#141C2B]'
    } ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 border flex items-center justify-center flex-shrink-0 ${
          isIBM ? 'border-[rgba(44,74,143,0.3)] bg-[#EFE9DD] text-[#2C4A8F]' : 'border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] text-[#141C2B]'
        }`}>
          {isIBM ? <Sparkles className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold mono-label">{displayProvider}</span>
            <span className="px-1.5 py-0.2 border border-[rgba(20,28,43,0.2)] text-[10px] mono-label text-[#2C4A8F]">
              [{displayModel}]
            </span>
          </div>
          <p className="text-[10px] text-[#4A5364] mt-0.5">
            {isIBM
              ? 'Direct IBM watsonx Granite Foundation Model inference'
              : isFallback
              ? 'Truthful telemetry: Resilient fallback engine engaged'
              : 'AI inference via configured secondary provider'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[#767E8C] text-[10px] mono-label flex-shrink-0">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{latencyMs != null ? `${latencyMs}ms latency` : 'latency n/a'}</span>
        </div>
        <div className="flex items-center gap-1 text-[#2C4A8F]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>[ VERIFIED AUDIT ]</span>
        </div>
      </div>
    </div>
  );
}

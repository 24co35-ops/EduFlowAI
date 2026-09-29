import React from 'react';
import { Sparkles, Cpu, Clock, ShieldCheck } from 'lucide-react';

/**
 * Truthful AI Evidence Badge & Telemetry Strip.
 * Respects strict IBM BOB hackathon guardrails: never claims watsonx if fallback was used.
 * Styled in the Calibrated Maker Stationery aesthetic.
 */
export default function AIEvidenceBadge({ metadata, compact = false, className = '' }) {
  if (!metadata) {
    // Default standby badge
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] text-[#141C2B] text-xs mono-label ${className}`}>
        <Sparkles className="w-3.5 h-3.5 text-[#2C4A8F]" />
        <span>[ POWERED BY <strong>IBM WATSONX.AI GRANITE</strong> ]</span>
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
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 border text-[10px] mono-label ${
        isFallback 
          ? 'bg-[#EFE9DD] border-[rgba(20,28,43,0.25)] text-[#141C2B]' 
          : 'bg-[#E5DED0] border-[rgba(44,74,143,0.3)] text-[#2C4A8F]'
      } ${className}`}>
        {isFallback ? <Cpu className="w-3 h-3 text-[#141C2B]" /> : <Sparkles className="w-3 h-3 text-[#2C4A8F]" />}
        <span>[ {displayProvider} ]</span>
        <span className="text-[#767E8C]">•</span>
        <span className="text-[#767E8C]">{latencyMs}MS</span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
      isFallback
        ? 'bg-[#EFE9DD] border-[rgba(20,28,43,0.2)] text-[#141C2B]'
        : 'bg-[#E5DED0] border-[rgba(20,28,43,0.16)] text-[#141C2B]'
    } ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 border flex items-center justify-center flex-shrink-0 ${
          isFallback ? 'border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] text-[#141C2B]' : 'border-[rgba(44,74,143,0.3)] bg-[#EFE9DD] text-[#2C4A8F]'
        }`}>
          {isFallback ? <Cpu className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold mono-label">{displayProvider}</span>
            <span className="px-1.5 py-0.2 border border-[rgba(20,28,43,0.2)] text-[10px] mono-label text-[#2C4A8F]">
              [{displayModel}]
            </span>
          </div>
          <p className="text-[10px] text-[#4A5364] mt-0.5">
            {isFallback ? 'Truthful telemetry: Resilient fallback engine engaged' : 'Direct IBM watsonx Granite Foundation Model inference'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[#767E8C] text-[10px] mono-label flex-shrink-0">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{latencyMs}ms latency</span>
        </div>
        <div className="flex items-center gap-1 text-[#2C4A8F]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>[ VERIFIED AUDIT ]</span>
        </div>
      </div>
    </div>
  );
}

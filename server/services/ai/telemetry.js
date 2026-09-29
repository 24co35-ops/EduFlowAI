/**
 * Safe In-Memory AI Request Telemetry & Metrics
 * No sensitive student data, passwords, or API keys are ever recorded.
 */

class TelemetryService {
  constructor() {
    this.requests = [];
    this.maxLogSize = 100;
    this.startTime = Date.now();
  }

  recordRequest({
    feature,
    provider,
    model,
    latencyMs,
    success,
    fallbackUsed = false,
    executionState = 'LIVE_AI',
    validationPassed = true,
    error = null
  }) {
    const entry = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      feature,
      provider,
      model: model || 'n/a',
      latencyMs: Math.round(latencyMs),
      success: Boolean(success),
      fallbackUsed: Boolean(fallbackUsed),
      executionState,
      validationPassed: Boolean(validationPassed),
      errorMessage: error ? String(error).substring(0, 150) : null
    };

    this.requests.unshift(entry);
    if (this.requests.length > this.maxLogSize) {
      this.requests.pop();
    }

    return entry;
  }

  getMetrics() {
    const total = this.requests.length;
    const successful = this.requests.filter(r => r.success).length;
    const watsonxCalls = this.requests.filter(r => r.provider === 'ibm_watsonx').length;
    const hfGraniteCalls = this.requests.filter(r => r.provider === 'ibm_granite_hf').length;
    const geminiCalls = this.requests.filter(r => r.provider === 'gemini').length;
    const fallbackCalls = this.requests.filter(r => r.fallbackUsed || r.provider === 'curriculum_engine').length;
    const validationFailures = this.requests.filter(r => !r.validationPassed).length;
    
    const totalLatency = this.requests.reduce((acc, r) => acc + (r.latencyMs || 0), 0);
    const avgLatencyMs = total > 0 ? Math.round(totalLatency / total) : 0;

    const lastIbmSuccess = this.requests.find(r => r.success && (r.provider === 'ibm_watsonx' || r.provider === 'ibm_granite_hf'));

    return {
      totalRequests: total,
      successfulRequests: successful,
      watsonxRequests: watsonxCalls,
      hfGraniteRequests: hfGraniteCalls,
      ibmGraniteTotal: watsonxCalls + hfGraniteCalls,
      geminiRequests: geminiCalls,
      fallbackRequests: fallbackCalls,
      validationFailures,
      avgLatencyMs,
      lastIbmSuccess: lastIbmSuccess ? lastIbmSuccess.timestamp : null,
      recentRequests: this.requests.slice(0, 10),
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000)
    };
  }
}

module.exports = new TelemetryService();

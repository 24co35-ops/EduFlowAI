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
    const ibmCalls = this.requests.filter(r => r.provider === 'ibm_bob').length;
    const fallbackCalls = this.requests.filter(r => r.fallbackUsed).length;
    const validationFailures = this.requests.filter(r => !r.validationPassed).length;
    
    const totalLatency = this.requests.reduce((acc, r) => acc + (r.latencyMs || 0), 0);
    const avgLatencyMs = total > 0 ? Math.round(totalLatency / total) : 0;

    const lastSuccess = this.requests.find(r => r.success && r.provider === 'ibm_bob');

    return {
      totalRequests: total,
      successfulRequests: successful,
      ibmBobRequests: ibmCalls,
      fallbackRequests: fallbackCalls,
      validationFailures,
      avgLatencyMs,
      lastIbmSuccess: lastSuccess ? lastSuccess.timestamp : null,
      recentRequests: this.requests.slice(0, 10),
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000)
    };
  }
}

module.exports = new TelemetryService();

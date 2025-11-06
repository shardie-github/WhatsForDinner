/**
 * Observability Suite - OpenTelemetry tracing + metrics
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { secretsManager } from './secrets-manager-unified.mjs';

const REPORTS_DIR = join(process.cwd(), 'ops', 'reports');

interface Metric {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
}

interface KPIMetrics {
  p95Latency: number;
  errorRate: number;
  costPerRequest: number;
  throughput: number;
  timestamp: string;
}

function initializeObservability() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'whats-for-dinner',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
    }),
    traceExporter: (await secretsManager.getSecret('OTEL_EXPORTER_OTLP_ENDPOINT')) || process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      ? new OTLPTraceExporter({
          url: (await secretsManager.getSecret('OTEL_EXPORTER_OTLP_ENDPOINT')) || process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
        })
      : undefined,
    metricReader: (await secretsManager.getSecret('OTEL_EXPORTER_OTLP_ENDPOINT')) || process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      ? new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({
            url: (await secretsManager.getSecret('OTEL_EXPORTER_OTLP_ENDPOINT')) || process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
          }),
          exportIntervalMillis: 60000, // 1 minute
        })
      : undefined,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  
  return sdk;
}

async function generateMetricsReport(): Promise<void> {
  // In a real implementation, would query Prometheus/OTLP endpoint
  // For now, generate mock metrics
  
  const metrics: KPIMetrics = {
    p95Latency: 245, // ms
    errorRate: 0.001, // 0.1%
    costPerRequest: 0.0001, // $0.0001 per request
    throughput: 1000, // requests per minute
    timestamp: new Date().toISOString()
  };

  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }

  writeFileSync(
    join(REPORTS_DIR, 'metrics.json'),
    JSON.stringify(metrics, null, 2)
  );

  // Generate HTML dashboard
  const html = generateDashboardHTML(metrics);
  writeFileSync(join(REPORTS_DIR, 'index.html'), html);

  }

function generateDashboardHTML(metrics: KPIMetrics): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Observability Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: #333;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #0070f3;
    }
    .metric-label {
      color: #666;
      margin-top: 8px;
    }
    .status-good {
      color: #22c55e;
    }
    .status-warning {
      color: #f59e0b;
    }
    .status-error {
      color: #ef4444;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Observability Dashboard</h1>
    <p>Last updated: ${metrics.timestamp}</p>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value ${metrics.p95Latency < 250 ? 'status-good' : 'status-warning'}">
          ${metrics.p95Latency}ms
        </div>
        <div class="metric-label">P95 Latency</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-value ${metrics.errorRate < 0.01 ? 'status-good' : 'status-error'}">
          ${(metrics.errorRate * 100).toFixed(2)}%
        </div>
        <div class="metric-label">Error Rate</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-value status-good">
          $${metrics.costPerRequest.toFixed(4)}
        </div>
        <div class="metric-label">Cost per Request</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-value status-good">
          ${metrics.throughput}/min
        </div>
        <div class="metric-label">Throughput</div>
      </div>
    </div>
    
    <div class="metric-card" style="margin-top: 20px;">
      <h3>Cost Breakdown</h3>
      <ul>
        <li>Supabase: $0.00005/request</li>
        <li>Vercel: $0.00003/request</li>
        <li>OpenAI: $0.00002/request</li>
      </ul>
    </div>
  </div>
</body>
</html>`;
}

if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'init') {
    initializeObservability();
  } else if (command === 'report') {
    generateMetricsReport().catch(error => {
      console.error('Failed to generate report:', error);
      process.exit(1);
    });
  } else {
        process.exit(1);
  }
}

export { initializeObservability, generateMetricsReport };

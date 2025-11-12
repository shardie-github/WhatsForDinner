/**
 * Observability dashboard generator
 */

import * as fs from 'fs';
import * as path from 'path';

// Removed unused export - not imported anywhere
function generateObservabilityDashboard() {
  const reportsDir = path.join(process.cwd(), 'ops', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const dashboardHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Observability Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: system-ui; max-width: 1400px; margin: 0 auto; padding: 20px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric-card { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    .metric-value { font-size: 2em; font-weight: bold; color: #333; }
    .metric-label { color: #666; margin-top: 5px; }
    h1 { color: #333; }
    .chart-container { margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Observability Dashboard</h1>
  <p>Last updated: <span id="lastUpdate">${new Date().toISOString()}</span></p>
  
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-value" id="p95Latency">245ms</div>
      <div class="metric-label">P95 Latency</div>
    </div>
    <div class="metric-card">
      <div class="metric-value" id="errorRate">0.2%</div>
      <div class="metric-label">Error Rate</div>
    </div>
    <div class="metric-card">
      <div class="metric-value" id="cost">$12.50</div>
      <div class="metric-label">Estimated Cost/day</div>
    </div>
  </div>
</body>
</html>`;

  const dashboardPath = path.join(reportsDir, 'index.html');
  fs.writeFileSync(dashboardPath, dashboardHTML);

  return dashboardPath;
}

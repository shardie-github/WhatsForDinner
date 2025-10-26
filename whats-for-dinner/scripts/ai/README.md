# AI Monitoring and Optimization Suite

This directory contains AI-powered monitoring and optimization scripts for the "What's for Dinner" application. These scripts provide automated monitoring, testing, and optimization capabilities to ensure the AI systems perform consistently and improve over time.

## Overview

The AI Monitoring Suite consists of four main components:

1. **Auto-Prompt Tuning** - Automatically optimizes AI prompts based on performance metrics
2. **Anomaly Detection** - Monitors system metrics and user behavior for anomalies
3. **Regression Testing** - Tests AI responses for regressions and quality degradation
4. **Cross-Platform Parity** - Ensures feature consistency between web and mobile clients

## Scripts

### 1. Auto-Prompt Tuning (`auto-prompt-tuning.js`)

Automatically optimizes OpenAI prompts based on performance metrics and user feedback.

**Features:**

- A/B testing framework for prompt variants
- Performance analysis and optimization suggestions
- Automated prompt generation and testing
- Comprehensive reporting and recommendations

**Usage:**

```bash
node auto-prompt-tuning.js
```

**Configuration:**

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `VERBOSE` - Enable verbose logging (true/false)

**Output:**

- `prompt-optimizations.json` - Detailed optimization results
- `prompt-optimization-report.html` - HTML report
- `optimized-prompts.js` - Generated optimized prompt templates

### 2. Anomaly Detection (`anomaly-detection.js`)

Monitors system metrics, user behavior, and AI responses for anomalies.

**Features:**

- Statistical anomaly detection using Z-score
- Moving average anomaly detection
- Pattern-based anomaly detection
- System metrics monitoring
- User behavior analysis
- Critical alert generation

**Usage:**

```bash
node anomaly-detection.js
```

**Configuration:**

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `VERBOSE` - Enable verbose logging (true/false)

**Output:**

- `anomaly-detection-report.json` - Detailed anomaly analysis
- `anomaly-detection-report.html` - HTML report
- `critical-alerts.json` - Critical anomaly alerts

### 3. Regression Testing (`regression-testing.js`)

Tests AI responses for regressions and quality degradation.

**Features:**

- Automated test case execution
- Response validation and scoring
- Regression detection and tracking
- Performance monitoring
- Comprehensive reporting

**Usage:**

```bash
node regression-testing.js
```

**Configuration:**

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `VERBOSE` - Enable verbose logging (true/false)

**Output:**

- `regression-test-results.json` - Test results and analysis
- `regression-test-report.html` - HTML report
- `baseline-results.json` - Baseline performance data

### 4. Cross-Platform Parity (`cross-platform-parity.js`)

Ensures feature consistency between web and native mobile clients.

**Features:**

- Cross-platform feature testing
- Parity issue detection
- Platform comparison analysis
- Performance consistency monitoring
- Comprehensive reporting

**Usage:**

```bash
node cross-platform-parity.js
```

**Configuration:**

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `VERBOSE` - Enable verbose logging (true/false)

**Output:**

- `cross-platform-parity-results.json` - Parity test results
- `cross-platform-parity-report.html` - HTML report

## Installation

1. Install dependencies:

```bash
npm install @supabase/supabase-js openai
```

2. Set environment variables:

```bash
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export OPENAI_API_KEY="your-openai-api-key"
export VERBOSE="true"
```

3. Make scripts executable:

```bash
chmod +x *.js
```

## Usage

### Running Individual Scripts

```bash
# Auto-prompt tuning
node auto-prompt-tuning.js

# Anomaly detection
node anomaly-detection.js

# Regression testing
node regression-testing.js

# Cross-platform parity
node cross-platform-parity.js
```

### Running All Scripts

```bash
# Run all monitoring scripts
for script in auto-prompt-tuning.js anomaly-detection.js regression-testing.js cross-platform-parity.js; do
  echo "Running $script..."
  node $script
done
```

### Scheduled Execution

Add to crontab for automated monitoring:

```bash
# Run every hour
0 * * * * cd /path/to/scripts/ai && node anomaly-detection.js

# Run every 6 hours
0 */6 * * * cd /path/to/scripts/ai && node auto-prompt-tuning.js

# Run daily
0 2 * * * cd /path/to/scripts/ai && node regression-testing.js

# Run weekly
0 3 * * 0 cd /path/to/scripts/ai && node cross-platform-parity.js
```

## Configuration

### Environment Variables

| Variable                    | Description               | Required | Default |
| --------------------------- | ------------------------- | -------- | ------- |
| `SUPABASE_URL`              | Supabase project URL      | Yes      | -       |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes      | -       |
| `OPENAI_API_KEY`            | OpenAI API key            | Yes      | -       |
| `VERBOSE`                   | Enable verbose logging    | No       | false   |

### Thresholds

Each script has configurable thresholds for different metrics:

#### Auto-Prompt Tuning

- Response time: 5000ms
- User satisfaction: 3.0/5.0
- Accuracy: 80%
- JSON validity: 95%

#### Anomaly Detection

- Response time: 5000ms
- Error rate: 5%
- User satisfaction: 3.0/5.0
- Memory usage: 80%
- CPU usage: 80%

#### Regression Testing

- Response time: 5000ms
- Accuracy: 80%
- Relevance: 80%
- Completeness: 80%
- Creativity: 70%

#### Cross-Platform Parity

- Response time: 2000ms
- Accuracy: 90%
- Feature completeness: 95%
- User satisfaction: 4.0/5.0
- Error rate: 5%

## Output Files

All scripts generate output files in the `../ai-monitoring` directory:

### JSON Reports

- Detailed data in JSON format
- Machine-readable for integration
- Historical data tracking

### HTML Reports

- Human-readable reports
- Interactive charts and graphs
- Detailed analysis and recommendations

### Alert Files

- Critical alerts for immediate attention
- Threshold violations
- System health status

## Integration

### GitHub Actions

Add to your CI/CD pipeline:

```yaml
- name: Run AI Monitoring
  run: |
    cd scripts/ai
    node anomaly-detection.js
    node regression-testing.js
```

### Slack Notifications

Configure Slack webhooks for alerts:

```javascript
// Add to each script
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

async function sendSlackAlert(message) {
  if (SLACK_WEBHOOK) {
    await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
  }
}
```

### Database Integration

Results are automatically stored in Supabase:

```sql
-- Create tables for monitoring data
CREATE TABLE ai_monitoring_results (
  id SERIAL PRIMARY KEY,
  script_name TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_alerts (
  id SERIAL PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Monitoring Dashboard

Create a monitoring dashboard using the generated data:

```javascript
// Example dashboard integration
const results = await fetch('/api/ai-monitoring/latest');
const data = await results.json();

// Display metrics
displayMetrics(data.summary);
displayAlerts(data.alerts);
displayTrends(data.trends);
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure all required environment variables are set
   - Check Supabase and OpenAI API keys

2. **Database Connection Issues**
   - Verify Supabase URL and service role key
   - Check network connectivity

3. **API Rate Limits**
   - Implement rate limiting for OpenAI API calls
   - Add retry logic with exponential backoff

4. **Memory Issues**
   - Monitor memory usage during script execution
   - Implement data pagination for large datasets

### Debug Mode

Enable verbose logging:

```bash
export VERBOSE=true
node auto-prompt-tuning.js
```

### Log Analysis

Check logs for errors:

```bash
# Check for errors in output
node anomaly-detection.js 2>&1 | grep -i error

# Monitor script execution
tail -f /var/log/ai-monitoring.log
```

## Performance Optimization

### Caching

Implement caching for frequently accessed data:

```javascript
const cache = new Map();

async function getCachedData(key, fetchFunction) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const data = await fetchFunction();
  cache.set(key, data);
  return data;
}
```

### Parallel Execution

Run multiple scripts in parallel:

```javascript
const scripts = [
  'auto-prompt-tuning.js',
  'anomaly-detection.js',
  'regression-testing.js',
  'cross-platform-parity.js',
];

await Promise.all(scripts.map(script => runScript(script)));
```

### Resource Management

Monitor and limit resource usage:

```javascript
// Set memory limits
process.setMaxListeners(0);
process.on('warning', warning => {
  console.warn('Warning:', warning.message);
});
```

## Security Considerations

### API Key Management

- Store API keys in environment variables
- Use secure key management services
- Rotate keys regularly

### Data Privacy

- Anonymize user data in monitoring
- Implement data retention policies
- Comply with privacy regulations

### Access Control

- Restrict access to monitoring scripts
- Implement authentication for dashboards
- Audit access logs

## Contributing

### Adding New Metrics

1. Define the metric in the configuration
2. Implement data collection logic
3. Add validation and scoring
4. Update reporting templates

### Adding New Test Cases

1. Define test case structure
2. Implement test execution logic
3. Add validation rules
4. Update reporting

### Adding New Platforms

1. Update platform configuration
2. Implement platform-specific logic
3. Add platform comparison metrics
4. Update reporting templates

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0

- Initial release
- Auto-prompt tuning
- Anomaly detection
- Regression testing
- Cross-platform parity testing

### Future Versions

- Machine learning integration
- Advanced analytics
- Real-time monitoring
- Automated remediation

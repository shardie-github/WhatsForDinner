# Performance Logs

**Generated**: {{ timestamp }}
**Time Range**: {{ time_range }}

## Lighthouse Metrics

### Performance Score

- **Overall**: {{ lighthouse_performance }}/100
- **First Contentful Paint**: {{ fcp }}ms
- **Largest Contentful Paint**: {{ lcp }}ms
- **Cumulative Layout Shift**: {{ cls }}
- **First Input Delay**: {{ fid }}ms
- **Time to Interactive**: {{ tti }}ms

### Accessibility Score

- **Overall**: {{ lighthouse_accessibility }}/100
- **Color Contrast**: {{ color_contrast }}
- **Keyboard Navigation**: {{ keyboard_nav }}
- **Screen Reader Support**: {{ screen_reader }}

### Best Practices Score

- **Overall**: {{ lighthouse_best_practices }}/100
- **HTTPS Usage**: {{ https_usage }}
- **Console Errors**: {{ console_errors }}
- **Image Optimization**: {{ image_optimization }}

### SEO Score

- **Overall**: {{ lighthouse_seo }}/100
- **Meta Tags**: {{ meta_tags }}
- **Structured Data**: {{ structured_data }}
- **Mobile Friendly**: {{ mobile_friendly }}

## API Performance

### Response Times

| Endpoint       | Min                   | Max                   | Avg                   | P95                   | P99                   |
| -------------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- |
| /api/dinner    | {{ dinner_min }}ms    | {{ dinner_max }}ms    | {{ dinner_avg }}ms    | {{ dinner_p95 }}ms    | {{ dinner_p99 }}ms    |
| /api/analytics | {{ analytics_min }}ms | {{ analytics_max }}ms | {{ analytics_avg }}ms | {{ analytics_p95 }}ms | {{ analytics_p99 }}ms |

### Throughput

- **Requests per Second**: {{ rps }}
- **Peak RPS**: {{ peak_rps }}
- **Concurrent Users**: {{ concurrent_users }}

### Error Rates

- **4xx Errors**: {{ error_4xx }}%
- **5xx Errors**: {{ error_5xx }}%
- **Timeout Rate**: {{ timeout_rate }}%

## Database Performance

### Query Performance

| Query Type | Avg Time           | Max Time           | Count              | Slow Queries      |
| ---------- | ------------------ | ------------------ | ------------------ | ----------------- |
| SELECT     | {{ select_avg }}ms | {{ select_max }}ms | {{ select_count }} | {{ select_slow }} |
| INSERT     | {{ insert_avg }}ms | {{ insert_max }}ms | {{ insert_count }} | {{ insert_slow }} |
| UPDATE     | {{ update_avg }}ms | {{ update_max }}ms | {{ update_count }} | {{ update_slow }} |
| DELETE     | {{ delete_avg }}ms | {{ delete_max }}ms | {{ delete_count }} | {{ delete_slow }} |

### Connection Pool

- **Active Connections**: {{ active_connections }}
- **Idle Connections**: {{ idle_connections }}
- **Max Connections**: {{ max_connections }}
- **Connection Wait Time**: {{ connection_wait }}ms

## Frontend Performance

### Bundle Analysis

- **Total Bundle Size**: {{ bundle_size }}KB
- **JavaScript Size**: {{ js_size }}KB
- **CSS Size**: {{ css_size }}KB
- **Image Size**: {{ image_size }}KB

### Loading Performance

- **Initial Load Time**: {{ initial_load }}ms
- **Time to First Byte**: {{ ttfb }}ms
- **DOM Content Loaded**: {{ dom_loaded }}ms
- **Window Load**: {{ window_load }}ms

### Resource Loading

| Resource Type | Count              | Total Size          | Load Time           |
| ------------- | ------------------ | ------------------- | ------------------- |
| Images        | {{ img_count }}    | {{ img_size }}KB    | {{ img_load }}ms    |
| Scripts       | {{ script_count }} | {{ script_size }}KB | {{ script_load }}ms |
| Stylesheets   | {{ css_count }}    | {{ css_size }}KB    | {{ css_load }}ms    |
| Fonts         | {{ font_count }}   | {{ font_size }}KB   | {{ font_load }}ms   |

## AI Model Performance

### Response Quality

- **Average Confidence Score**: {{ ai_confidence }}/1.0
- **User Satisfaction**: {{ user_satisfaction }}/5.0
- **Recipe Completeness**: {{ recipe_completeness }}%

### Processing Times

- **Average Generation Time**: {{ ai_generation_time }}ms
- **Token Processing Rate**: {{ token_rate }} tokens/sec
- **Model Load Time**: {{ model_load_time }}ms

### Cost Analysis

- **Total API Calls**: {{ total_api_calls }}
- **Total Cost**: ${{ total_cost }}
- **Cost per Recipe**: ${{ cost_per_recipe }}
- **Token Usage**: {{ total_tokens }}

## System Resources

### CPU Usage

- **Average CPU**: {{ avg_cpu }}%
- **Peak CPU**: {{ peak_cpu }}%
- **CPU Cores**: {{ cpu_cores }}

### Memory Usage

- **Average Memory**: {{ avg_memory }}MB
- **Peak Memory**: {{ peak_memory }}MB
- **Memory Leaks**: {{ memory_leaks }}

### Disk Usage

- **Total Storage**: {{ total_storage }}GB
- **Used Storage**: {{ used_storage }}GB
- **Available Storage**: {{ available_storage }}GB

## Error Analysis

### Error Types

| Error Type        | Count                   | Percentage                   | Trend                         |
| ----------------- | ----------------------- | ---------------------------- | ----------------------------- |
| API Errors        | {{ api_errors }}        | {{ api_errors_pct }}%        | {{ api_errors_trend }}        |
| Database Errors   | {{ db_errors }}         | {{ db_errors_pct }}%         | {{ db_errors_trend }}         |
| Validation Errors | {{ validation_errors }} | {{ validation_errors_pct }}% | {{ validation_errors_trend }} |
| Network Errors    | {{ network_errors }}    | {{ network_errors_pct }}%    | {{ network_errors_trend }}    |

### Error Trends

- **Error Rate Trend**: {{ error_trend }}
- **Critical Errors**: {{ critical_errors }}
- **Resolved Errors**: {{ resolved_errors }}
- **Open Issues**: {{ open_issues }}

## Optimization Recommendations

### High Priority

{{ high_priority_recommendations }}

### Medium Priority

{{ medium_priority_recommendations }}

### Low Priority

{{ low_priority_recommendations }}

## Performance History

### 7-Day Trends

- **Performance Score**: {{ performance_trend_7d }}
- **Response Time**: {{ response_time_trend_7d }}
- **Error Rate**: {{ error_rate_trend_7d }}
- **User Satisfaction**: {{ satisfaction_trend_7d }}

### 30-Day Trends

- **Performance Score**: {{ performance_trend_30d }}
- **Response Time**: {{ response_time_trend_30d }}
- **Error Rate**: {{ error_rate_trend_30d }}
- **User Satisfaction**: {{ satisfaction_trend_30d }}

---

_This report is generated automatically by the performance monitoring system._
_For real-time metrics, visit the admin dashboard._

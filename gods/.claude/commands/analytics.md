# /baco analytics

View analytics and insights from BACO's Smart Routing system.

## ACTIVATION

When the user invokes `/baco analytics [subcommand]`, display routing analytics and performance metrics.

## Subcommands

### 1. Dashboard (Default)
**Command**: `/baco analytics` or `/baco analytics dashboard`

Shows real-time routing metrics and recent activity:

```
📊 SMART ROUTING ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Real-time Metrics
├─ Average Confidence: 82.5%
├─ Routing Trend: improving ↗
└─ Active Alerts: 0

👥 Top Agents (Last 10 Requests)
├─ Hephaestus: 4 requests
├─ Daedalus: 3 requests
├─ Themis: 2 requests
└─ Apollo: 1 request

⚠️  Alerts
└─ No active alerts

📊 Session Statistics
├─ Total Requests: 47
├─ Acceptance Rate: 89%
├─ Override Rate: 11%
└─ Avg Response Time: 73ms
```

### 2. Agent Performance
**Command**: `/baco analytics agents`

Shows detailed performance metrics for each agent:

```
👥 AGENT PERFORMANCE ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 Performance Rankings

1. Daedalus (System Architect)
   ├─ Total Routed: 145
   ├─ Acceptance Rate: 92%
   ├─ Success Rate: 88%
   ├─ Avg Confidence: 87%
   ├─ User Rating: 9.2/10
   └─ Top Domains: architecture, system_design, scalability

2. Hephaestus (Senior Developer)
   ├─ Total Routed: 198
   ├─ Acceptance Rate: 88%
   ├─ Success Rate: 91%
   ├─ Avg Confidence: 84%
   ├─ User Rating: 8.9/10
   └─ Top Domains: implementation, debugging, frontend

[Additional agents...]
```

### 3. Domain Analysis
**Command**: `/baco analytics domains`

Shows routing performance by domain:

```
🏷️ DOMAIN ROUTING ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Domain Performance

Architecture
├─ Request Count: 89
├─ Avg Complexity: 7.2/10
├─ Success Rate: 91%
├─ Top Agents:
│  ├─ Daedalus: 72 (81%)
│  ├─ Janus: 12 (13%)
│  └─ Hephaestus: 5 (6%)
└─ Avg Duration: 2.3 days

Implementation
├─ Request Count: 156
├─ Avg Complexity: 5.8/10
├─ Success Rate: 93%
├─ Top Agents:
│  ├─ Hephaestus: 128 (82%)
│  ├─ Daedalus: 18 (12%)
│  └─ Themis: 10 (6%)
└─ Avg Duration: 1.5 days

[Additional domains...]
```

### 4. Routing Patterns
**Command**: `/baco analytics patterns`

Shows learned routing patterns:

```
🔄 LEARNED ROUTING PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ High-Confidence Patterns

Pattern #1
├─ Domains: [security, authentication]
├─ Technologies: [jwt, oauth]
├─ Complexity: 6-8
├─ Best Agent: Aegis (95% success)
├─ Occurrences: 23
└─ Avg Performance: 9.1/10

Pattern #2
├─ Domains: [ui, user_experience]
├─ Technologies: [react, css]
├─ Complexity: 4-6
├─ Best Agent: Apollo (92% success)
├─ Occurrences: 31
└─ Avg Performance: 8.8/10

[Additional patterns...]
```

### 5. Weekly Report
**Command**: `/baco analytics report [week]`

Generates comprehensive weekly report:

```
📅 WEEKLY ROUTING REPORT (Jan 15-21, 2024)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary
├─ Total Requests: 312
├─ Unique Users: 45
├─ Avg Confidence: 83.7%
├─ Acceptance Rate: 87.2%
├─ Success Rate: 91.5%
└─ Avg Task Duration: 1.8 days

📈 Trends
├─ Request Volume: ↗ +15% from last week
├─ Confidence: ↗ +3.2% from last week
├─ Success Rate: → Stable
└─ User Satisfaction: ↗ +0.4 points

🎯 Recommendations
1. [HIGH] Daedalus has low acceptance for frontend tasks
   → Update capability metadata to exclude pure frontend
   
2. [MEDIUM] High override rate for security domain
   → Review Aegis's routing patterns
   
3. [LOW] Janus underutilized for complex tasks
   → Lower complexity threshold for orchestration

[Full report continues...]
```

### 6. Export Data
**Command**: `/baco analytics export [format]`

Export analytics data:
- `json` - Full analytics data in JSON
- `csv` - Summary statistics in CSV
- `report` - Formatted markdown report

## Interactive Features

### Drill-Down Analysis

When viewing analytics, you can drill down for more details:

```
Select metric to explore:
1. Agent Performance Details
2. Domain Breakdown
3. Technology Analysis
4. Time-based Trends
5. User Behavior Patterns

Choice: 2

Domain: implementation
Period: Last 30 days

[Detailed implementation domain analysis...]
```

### Custom Queries

**Command**: `/baco analytics query`

Run custom analytics queries:

```
Analytics Query Builder
━━━━━━━━━━━━━━━━━━━━━━

Metric: routing_confidence
Grouping: agent
Period: last_7_days
Filter: complexity > 7

Results:
├─ Daedalus: 89.2% avg confidence
├─ Janus: 85.7% avg confidence
├─ Aegis: 82.1% avg confidence
└─ Hephaestus: 71.3% avg confidence
```

## Configuration

Analytics behavior is controlled by feature flags:

```javascript
ANALYTICS_CONFIG = {
  ENABLE_ANALYTICS: true,
  RETENTION_DAYS: 30,
  ANONYMIZE_DATA: true,
  EXPORT_FORMATS: ['json', 'csv', 'markdown']
}
```

## Privacy

- Task descriptions are anonymized
- No personal data is collected
- Analytics are stored locally
- Data can be cleared with `/baco analytics clear`

## Usage Examples

### Quick Health Check
```
/baco analytics

# Shows dashboard with key metrics
```

### Investigate Low Confidence
```
/baco analytics agents

# Find agents with low confidence scores
# Review their recent routing decisions
```

### Weekly Review
```
/baco analytics report

# Generate report for team review
# Export as markdown for sharing
```

### Performance Optimization
```
/baco analytics patterns

# Identify successful patterns
# Update routing rules based on data
```

## Visual Elements

The analytics command uses visual indicators:
- 📈 Improving metrics (green)
- 📉 Declining metrics (red)
- → Stable metrics (yellow)
- ✅ Success indicators
- ⚠️ Warning alerts
- 🏆 Top performers

## Integration

Analytics integrates with:
- `/baco route` - Records all routing decisions
- `/workflow` - Tracks workflow routing
- Smart Router libraries - Collects performance data

This comprehensive analytics system helps optimize BACO's routing decisions through data-driven insights.
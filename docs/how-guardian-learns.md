# How Guardian Learns

Guardian uses a Trust Fabric AI layer that learns from your behavior and adapts to your comfort zones.

## Learning Mechanisms

### 1. Privacy Mode Toggle Frequency

Guardian tracks how often you enable/disable privacy modes:

```typescript
if (user_toggles_privacy_mode > 10) {
  recommendation = "Consider tighter defaults";
}
```

**What it learns:**
- You prefer more control
- Default policies may be too permissive
- Adaptive risk weights should increase

### 2. Signal Preferences

Guardian observes which signals you disable:

```typescript
if (signals_disabled.length > 3) {
  recommendation = "Update default policy";
}
```

**What it learns:**
- Your comfort level with different data types
- Which sensors you're uncomfortable with
- Preferred privacy posture

### 3. Risk Tolerance

Guardian analyzes your decisions on high-risk events:

**If you block:**
```typescript
adaptive_risk_weights[data_class].likelihood += 0.1;
// "User doesn't trust this - increase likelihood weight"
```

**If you allow high-risk:**
```typescript
adaptive_risk_weights[data_class].impact -= 0.5;
// "User is comfortable - decrease impact weight"
```

**What it learns:**
- Your risk tolerance per data class
- When you're willing to accept higher risk
- When you want stricter controls

### 4. Average Trust Responses

Guardian tracks the average risk level you accept for each data class:

```typescript
average_trust_responses[data_class] = risk_level;
```

**Example:**
- Location: You always allow (low risk tolerance)
- Audio: You always block (high risk tolerance)

## Adaptive Recommendations

Guardian generates three types of recommendations:

### Tighter Controls

**Trigger:** Frequent privacy mode toggles
```typescript
{
  type: 'tighter',
  reason: 'Frequent privacy mode toggles suggest desire for tighter controls',
  suggested_action: 'mask',
  confidence: 0.7
}
```

### Looser Controls

**Trigger:** Consistent allow decisions on medium-risk events
```typescript
{
  type: 'looser',
  reason: 'Consistent allowance suggests comfort with current settings',
  suggested_action: 'allow',
  confidence: 0.6
}
```

### Policy Updates

**Trigger:** Multiple signals disabled
```typescript
{
  type: 'policy_update',
  reason: 'Multiple signals disabled - consider updating default policy',
  suggested_action: 'mask',
  confidence: 0.8
}
```

## Trust Fabric Model

The model stores:

```typescript
{
  user_id: string;
  comfort_zones: {
    privacy_mode_toggles: number;
    signals_disabled: string[];
    average_trust_responses: Record<DataClass, RiskLevel>;
  };
  adaptive_risk_weights: Record<DataClass, {
    impact: number;
    likelihood: number;
  }>;
  learned_preferences: Record<string, unknown>;
}
```

## Learning Timeline

### Day 1-7: Baseline
- Guardian observes behavior
- Builds initial comfort zones
- Establishes risk tolerance baselines

### Week 2-4: Adaptation
- Starts generating recommendations
- Adjusts risk weights
- Learns preferences

### Month 2+: Refinement
- Fine-tunes recommendations
- Adapts to changing preferences
- Optimizes for your privacy posture

## Privacy Guarantees

- **Local Learning**: All learning happens locally
- **No External Data**: No data sent to external services
- **User Control**: You can reset or export your model
- **Transparency**: All recommendations explainable

## Reset Learning

To reset your Trust Fabric model:

```typescript
// Delete model file
fs.unlinkSync(`/tmp/guardian/models/${userId}_fabric.json`);

// Or export current, modify, and re-import
const model = await trustFabricAI.exportModel(userId);
// ... modify ...
await trustFabricAI.importModel(model);
```

## Export/Import

Your learned preferences are portable:

**Export:**
```bash
curl /api/guardian/fabric/export > my_trust_fabric.json
```

**Import:**
```bash
curl -X POST /api/guardian/fabric/import \
  -H "Content-Type: application/json" \
  -d @my_trust_fabric.json
```

## Best Practices

1. **Review Recommendations**: Check weekly recommendations
2. **Adjust Gradually**: Don't change everything at once
3. **Export Regularly**: Backup your Trust Fabric model
4. **Understand Why**: Use Guardian GPT to explain recommendations

## Example Learning Scenario

**Week 1:**
- User enables privacy mode 5 times
- Guardian learns: "User wants more control"

**Week 2:**
- Guardian recommends tighter defaults
- User accepts recommendation
- Adaptive risk weights increase

**Week 3:**
- User blocks 2 location access attempts
- Guardian learns: "User doesn't trust location"
- Location risk weights increase

**Week 4:**
- Guardian auto-suggests masking location
- User's comfort improves
- Fewer privacy mode toggles

## Questions?

Use Guardian GPT to ask:
- "Why did Guardian recommend this?"
- "What did Guardian learn from my behavior?"
- "How can I adjust my privacy preferences?"

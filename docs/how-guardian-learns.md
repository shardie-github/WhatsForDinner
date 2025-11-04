# How Guardian Learns

Guardian's Trust Fabric AI learns your privacy preferences by observing your behavior and adapting recommendations accordingly.

## Learning Process

### 1. Behavior Observation

Guardian observes:
- Which data classes you allow/block
- How often you toggle privacy modes
- Which signals you disable
- Your response to risk alerts

### 2. Comfort Zone Calculation

For each data class (location, audio, telemetry, etc.), Guardian calculates:
- **Average Trust Score**: How comfortable you are with this data type (0-100)
- **Preferred Action**: Your typical choice (allow, mask, block)
- **Disabled Signals**: Which specific signals you've turned off

### 3. Pattern Recognition

Guardian identifies patterns:
- **Always Allows**: Data classes you consistently allow
- **Always Blocks**: Data classes you consistently block
- **Frequently Modified**: Settings you change often

### 4. Adaptive Recommendations

Based on learned patterns, Guardian suggests:
- **Tighten**: Privacy settings for data classes with low trust scores
- **Loosen**: Privacy settings for data classes with high trust scores
- **Rationale**: Explanation of why recommendations were made

## Example Learning Scenario

1. User consistently blocks location access
2. Guardian learns: `location` → `alwaysBlocks: ['location']`
3. Guardian adjusts: Default action for location becomes `block`
4. Guardian recommends: "Consider tightening privacy settings for: location"

## Trust Fabric Model

The model stores:
```json
{
  "userId": "...",
  "comfortZones": {
    "location": {
      "averageTrust": 20,
      "preferredAction": "block",
      "disabledSignals": []
    }
  },
  "privacyModeToggles": 5,
  "learnedPreferences": {
    "alwaysAllows": ["telemetry"],
    "alwaysBlocks": ["location", "audio"],
    "frequentlyModified": ["biometrics"]
  }
}
```

## Export/Import

Export your Trust Fabric model to:
- Backup your preferences
- Transfer to another device
- Share with trusted parties (optional)

Import to restore preferences on a new device.

## Privacy

The Trust Fabric model is:
- Stored locally (by default)
- User-owned
- Exportable
- Never shared without consent

## Continuous Learning

Guardian continuously learns from:
- Every privacy decision you make
- Every mode toggle
- Every policy change
- Every risk response

The model updates in real-time as you use the app.

## Reset Learning

You can reset Guardian's learning at any time:
- Clear the Trust Fabric model
- Start fresh with default policies
- Your ledger history remains intact

---

For more details, see `docs/privacy-api-reference.md`.

#!/usr/bin/env python3
import os
import json
import glob
import random
import textwrap

os.makedirs("docs/scenarios", exist_ok=True)

def blueprint(name, focus):
  return f"""## {name}
- Focus: {focus}
- Est. Complexity: {random.choice(['Low','Medium','High'])}
- Est. Dev Effort: {random.randint(3,12)} weeks
- Risk: {random.choice(['Low','Med','High'])}
- Expected Wins: {random.choice(['Perf +30%','DX +40%','CRO +15%','Cost -20%'])}
- Key Changes: service boundaries, caching, contract tests, observability
"""

with open("docs/scenarios/forecast.md", "w") as f:
  f.write("# Architecture Scenario Forecast\n\n")
  f.write(blueprint("A) Modular Monolith Hardening", "entropy reduction, faster CI"))
  f.write(blueprint("B) Event-Driven Core", "resilience, async workloads"))
  f.write(blueprint("C) Edge/Worker Tier", "latency, global scale"))

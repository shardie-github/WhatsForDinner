#!/usr/bin/env bash
set -euo pipefail

# Bundle release artifacts: SBOMs, investor pack, checksums
mkdir -p dist dist/SBOM

echo "Generating SBOMs..."

# Node.js SBOM
if [ -f package.json ]; then
  echo "  Generating Node.js SBOM..."
  npx --yes @cyclonedx/cyclonedx-npm@1 --output-format json --output-file dist/SBOM/sbom-node.json 2>/dev/null || echo "  Warning: Node SBOM generation failed"
fi

# Python SBOM
if [ -f requirements.txt ] || [ -f pyproject.toml ]; then
  echo "  Generating Python SBOM..."
  python3 -m pip install --quiet --user cyclonedx-bom==4.1.6 >/dev/null 2>&1 || true
  cyclonedx-py --format json --outfile dist/SBOM/sbom-py.json 2>/dev/null || echo "  Warning: Python SBOM generation failed"
fi

echo "Bundling investor pack..."
# Create investor pack ZIP
if [ -d docs/audit_investor_suite ]; then
  zip -qr dist/investor_pack.zip docs/audit_investor_suite || echo "  Warning: ZIP creation failed"
fi

echo "Generating checksums..."
# Generate SHA256 checksums
(cd dist && find . -type f -exec sha256sum {} \; | tee SHA256SUMS.txt || echo "  Warning: Checksum generation failed")

echo "Release bundle complete."

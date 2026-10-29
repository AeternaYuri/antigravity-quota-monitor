#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  Antigravity Quota Monitor - Installer (Unix)"
echo "========================================================"
echo ""

TARGET_DIR="${HOME}/.gemini/config/plugins/antigravity-quota-monitor"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[*] Installing plugin to: ${TARGET_DIR}"
mkdir -p "${TARGET_DIR}/src" "${TARGET_DIR}/sidecars" "${TARGET_DIR}/skills"

cp -f "${SCRIPT_DIR}/plugin.json" "${TARGET_DIR}/"
cp -f "${SCRIPT_DIR}/mcp_config.json" "${TARGET_DIR}/"
cp -f "${SCRIPT_DIR}/package.json" "${TARGET_DIR}/"
cp -f "${SCRIPT_DIR}/README.md" "${TARGET_DIR}/"
cp -rf "${SCRIPT_DIR}/src/"* "${TARGET_DIR}/src/"
cp -rf "${SCRIPT_DIR}/sidecars/"* "${TARGET_DIR}/sidecars/"
cp -rf "${SCRIPT_DIR}/skills/"* "${TARGET_DIR}/skills/"

echo "[✓] Successfully installed!"
echo "Open in Antigravity chat: sidecar://antigravity-quota-monitor/quota_viewer/"

#!/bin/sh
# Roda na subida do container: grava no env.js a URL da API, a do tempo real (ws) e o client ID do Google do ambiente
# (homologação ou produção) e o e-mail do suporte. O client ID é público (ADR-048); sem ele, o botão do Google não
# aparece. Sem SUPPORT_EMAIL, o app usa suporte@cromocard.dev.
set -eu

: "${API_URL:?Defina a variável API_URL}"
: "${WS_URL:?Defina a variável WS_URL}"

printf 'window.__ENV__ = { API_URL: "%s", WS_URL: "%s", GOOGLE_CLIENT_ID: "%s", SUPPORT_EMAIL: "%s" };\n' \
  "$API_URL" "$WS_URL" "${GOOGLE_CLIENT_ID:-}" "${SUPPORT_EMAIL:-}" \
  > /usr/share/nginx/html/env.js

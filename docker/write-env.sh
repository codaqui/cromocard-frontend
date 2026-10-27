#!/bin/sh
# Roda na subida do container: grava no env.js a URL da API e o client ID do Google do ambiente
# (homologação ou produção). O client ID é público (ADR-048); sem ele, o botão do Google não aparece.
set -eu

: "${API_URL:?Defina a variável API_URL}"

printf 'window.__ENV__ = { API_URL: "%s", GOOGLE_CLIENT_ID: "%s" };\n' "$API_URL" "${GOOGLE_CLIENT_ID:-}" \
  > /usr/share/nginx/html/env.js

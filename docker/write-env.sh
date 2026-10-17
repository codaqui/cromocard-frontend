#!/bin/sh
# Roda na subida do container: grava no env.js a URL da API do ambiente (homologação ou produção).
set -eu

: "${API_URL:?Defina a variável API_URL}"

printf 'window.__ENV__ = { API_URL: "%s" };\n' "$API_URL" > /usr/share/nginx/html/env.js

# Imagem do frontend (cromocard-web). Build a partir da raiz do repositório:
#   docker build -f docker/Dockerfile -t cromocard-web .
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# nginx sem root, escutando na 8080 (porta usada pelo túnel no compose).
FROM nginxinc/nginx-unprivileged:1.30-alpine AS runtime
# A imagem base sai antes das correções do Alpine; sem atualizar, o Trivy do CI reprova (ADR-055, decisão 6).
# O CI refaz este estágio sem cache (no-cache-filters: runtime), senão o apk upgrade antigo seria reaproveitado.
USER root
RUN apk upgrade --no-cache
USER 101
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY docker/write-env.sh /docker-entrypoint.d/40-write-env.sh
EXPOSE 8080

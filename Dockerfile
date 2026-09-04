# syntax=docker/dockerfile:1
#
# Multi-stage, multi-target build. `deps` is shared by both runtime images so
# `npm ci` only runs once; `docker-compose.yml` builds the `api` and `web`
# targets as two separate containers from this one file.

# ---- deps: install once, reused by the build and api stages ---------------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: compile the Angular production bundle -------------------------
FROM deps AS build
COPY . .
RUN npm run build

# ---- api: serves the mock backend (json-server) ----------------------------
FROM deps AS api
WORKDIR /app
COPY mock-api ./mock-api
COPY scripts ./scripts
EXPOSE 3000
CMD ["npx", "json-server", "mock-api/db.json", "--host", "0.0.0.0", "--port", "3000"]

# ---- web: serves the built Angular app behind nginx, proxying /api --------
FROM nginx:alpine AS web
COPY --from=build /app/dist/task-management-dashboard/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

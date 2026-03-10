FROM node:22.0-alpine AS builder

ARG BASE_HREF="/supersplat/"
ENV BASE_HREF=$BASE_HREF

RUN apk add --no-cache git
WORKDIR /app

COPY . .
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc NPM_CONFIG_USERCONFIG=/root/.npmrc npm ci

RUN npm run build

FROM nginx:alpine
LABEL authors="MYX AD"

ENV MAX_BODY_SIZE="5000M"
# BACKEND_URL and TILES_BACKEND_URL are set at runtime via docker-compose environment
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

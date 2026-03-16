FROM node:22.0-alpine AS builder

ARG BASE_HREF="/supersplat/"
ENV BASE_HREF=$BASE_HREF

RUN apk add --no-cache git
WORKDIR /app

COPY . .
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc NPM_CONFIG_USERCONFIG=/root/.npmrc npm ci

RUN npm run build

FROM node:22.0-alpine
LABEL authors="MYX AD"

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist /app/dist

EXPOSE 4000
CMD ["serve", "dist", "-C", "-l", "4000"]

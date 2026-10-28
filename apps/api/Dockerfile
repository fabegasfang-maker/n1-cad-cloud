FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=8787
ENV CACHE_DIR=/data/cache
ENV CONVERT_CONCURRENCY=1
ENV CONVERT_QUEUE_MAX=8

RUN mkdir -p /data/cache
VOLUME ["/data/cache"]

EXPOSE 8787
CMD ["node", "src/index.js"]

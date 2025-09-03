FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN set -eux; \
    if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci --omit=dev --no-audit --no-fund; \
    else \
      npm install --omit=dev --no-audit --no-fund; \
    fi

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=5005

USER node

EXPOSE 5005

CMD ["node", "server.js"]

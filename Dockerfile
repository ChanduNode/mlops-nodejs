
# FROM node:22-alpine@sha256:XXXXXXXXXXXXXXXX...
# WORKDIR /app
# RUN apt-get update && apt-get install -y python3 python3-pip git && rm -rf /var/lib/apt/lists/*
# RUN pip3 install --break-system-packages "dvc[s3]"
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
# RUN chmod +x scripts/docker-entrypoint.sh
# EXPOSE 8080
# CMD ["./scripts/docker-entrypoint.sh"]

FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY models ./models

RUN npm run build

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/src/server.js"]
# RIMIND Backend — Node.js + TypeScript
# SRS: Ubuntu/EC2; Docker + docker-compose

FROM node:20 AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json ./
RUN npm install --omit=dev

# Build
FROM base AS builder
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/openapi.yaml ./openapi.yaml
EXPOSE 4000
CMD ["node", "dist/server.js"]

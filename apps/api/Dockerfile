# FROM node:20-alpine AS base
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/

# Instalar dependências
RUN npm ci

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar OpenSSL para o Prisma
RUN apk add --no-cache openssl openssl-dev

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./packages/db/prisma/schema.prisma

# Build all packages using Turbo (from monorepo root)
RUN npm run build -- --filter=@estoque-hsi/api

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar OpenSSL para o Prisma
RUN apk add --no-cache openssl

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/db ./packages/db
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3001

CMD ["node", "dist/apps/api/src/main"]

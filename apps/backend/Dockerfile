FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Provide dummy env vars so prisma generate doesn't fail when parsing the schema/config
ARG DATABASE_URL="postgresql://dummy:dummy@localhost/dummy"
ARG DIRECT_URL="postgresql://dummy:dummy@localhost/dummy"
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL

RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/prisma ./prisma
ARG DATABASE_URL="postgresql://dummy:dummy@localhost/dummy"
ARG DIRECT_URL="postgresql://dummy:dummy@localhost/dummy"
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["npm", "start"]

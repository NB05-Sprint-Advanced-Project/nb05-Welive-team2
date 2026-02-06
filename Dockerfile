FROM node:24-alpine AS builder
WORKDIR /server

# 의존성 레이어 고정
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사 후 빌드
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /server
ENV NODE_ENV=production

# 런타임 의존성만 설치
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 빌드 산출물 + prisma 런타임만 복사
COPY --from=builder /server/dist ./dist
COPY --from=builder /server/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /server/node_modules/@prisma/client ./node_modules/@prisma/client

CMD ["npm", "run", "prod"]

FROM node:24-alpine AS migrator
WORKDIR /migrator
COPY --from=builder /server/node_modules ./node_modules
COPY --from=builder /server/prisma ./prisma
COPY --from=builder /server/package.json ./package.json
CMD ["npx", "prisma", "migrate", "deploy"]

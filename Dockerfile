FROM node:24-alpine AS builder
WORKDIR /server
COPY prisma ./prisma
COPY src ./src
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
RUN npm ci
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /server
COPY package.json .
COPY package-lock.json .
RUN npm ci --omit=dev 
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
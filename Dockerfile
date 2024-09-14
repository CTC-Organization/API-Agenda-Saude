FROM node:20.15.1-bookworm-slim

ARG DATABASE_URL

ARG MONGODB_URI

WORKDIR /usr/src/api

COPY . .

RUN npm install -g pnpm@8.6.12

RUN pnpm install

RUN apt-get update -y && apt-get install -y openssl

RUN npx prisma generate

RUN apt-get update -y && apt-get install -y openssl

ENV DATABASE_URL=${DATABASE_URL}

ENV MONGODB_URI=${MONGODB_URI}

RUN pnpm run build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && pnpm run start:prod"]
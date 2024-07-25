FROM node:20.15.1-bookworm-slim
WORKDIR /usr/src/api
COPY package.json pnpm-lock.yaml tsconfig.build.json tsconfig.json prisma src nest-cli.json test .tool-versions .env ./
EXPOSE 8080
RUN npm install -g pnpm@8.6.12
RUN pnpm install
RUN apt-get update -y && apt-get install -y openssl
RUN npx prisma generate
CMD ["npx" ,"prisma", "migrate", "deploy","&&","pnpm", "run", "build","&&","pnpm", "run", "start:prod"]
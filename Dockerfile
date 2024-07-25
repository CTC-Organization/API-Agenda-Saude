FROM node:20.15.1-bookworm-slim
WORKDIR /usr/src/api
COPY package.json pnpm-lock.yaml tsconfig.build.json tsconfig.json prisma src nest-cli.json test .tool-versions ./
RUN npm install -g pnpm@8.6.12
RUN pnpm install
RUN npx prisma generate
RUN npx prisma migrate deploy
RUN pnpm run build
EXPOSE 8080
CMD ["pnpm", "run", "start:prod"]
FROM node:20-bookworm-slim

WORKDIR /usr/src/api

COPY . .

RUN npm install -g pnpm
RUN pnpm install --quiet --no-optional --loglevel=error
RUN npx prisma generate
RUN pnpm run build

EXPOSE 8080

CMD ["pnpm", "run", "start:prod"]
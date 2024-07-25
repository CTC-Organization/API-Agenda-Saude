FROM node:20.15.1-bookworm-slim

# Definir a variável de ambiente como argumento
ARG DATABASE_URL

# Configurar o diretório de trabalho
WORKDIR /usr/src/api

# Copiar os arquivos necessários
COPY package.json pnpm-lock.yaml tsconfig.build.json tsconfig.json prisma src nest-cli.json test .tool-versions ./

# Instalar pnpm globalmente
RUN npm install -g pnpm@8.6.12

# Instalar dependências
RUN pnpm install

# Gerar o cliente Prisma
RUN npx prisma generate

# Instalar o OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Definir a variável de ambiente para o prisma migrate deploy
ENV DATABASE_URL=${DATABASE_URL}

# Executar as migrações do Prisma
RUN npx prisma migrate deploy

# Construir a aplicação
RUN pnpm run build

# Expor a porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["pnpm", "run", "start:prod"]

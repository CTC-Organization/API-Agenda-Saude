# Use uma imagem base do Node.js genérica
FROM node:20.15.1-bookworm-slim

# Defina o diretório de trabalho
WORKDIR /usr/src/api

# Copie os arquivos package.json e pnpm-lock.yaml para o diretório de trabalho
COPY package.json pnpm-lock.yaml tsconfig.build.json tsconfig.json prisma src nest-cli.json test .tool-verions ./

# Instale o pnpm na versão específica
RUN npm install -g pnpm@8.6.12

# Instale as dependências do projeto
RUN pnpm install

# Copie o restante dos arquivos do projeto
COPY . .

# Gere o cliente Prisma
RUN npx prisma generate

# Aplique as migrações do Prisma
RUN npx prisma migrate deploy

# Construa o projeto
RUN pnpm run build

# Exponha a porta que o aplicativo usará
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["pnpm", "run", "start:prod"]
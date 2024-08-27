# API ⇒ para integração dos sistemas

## Dicas de Acesso

### Downloads e Configurações Iniciais

### Ferramentas:

-   **Bancos:**
    -   PostgreSQL (relacional)
    -   Google Cloud Storage (storage)
-   **Back end:**
    -   Node.js
    -   Nest.js
    -   [Prisma.io](http://prisma.io/)

### Windows

-   **Banco de Dados Local:**
    -   Instalar WSL 2: [Guia de Instalação](https://learn.microsoft.com/pt-br/windows/wsl/install)
    -   Instalar Ubuntu no WSL 2: Baixar na Microsoft Store e resetar o PC
    -   Instalar Docker Desktop: [Guia de Instalação](https://docs.docker.com/desktop/install/windows-install/)

**Para rodar:**

-   Baixar imagens do PostgreSQL
-   Iniciar com os valores das variáveis do env
-   Conecta no docker desktop em Settings -> Integrations -> Ubuntu, e conectar o ubuntu do WSL2 ao Docker
-   Rodar container configurado

-   **Back-end:**
    -   Colocar .env
    -   Instalar NVM: [Guia de Instalação](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/)
    -   Instalar PNPM: [Guia de Instalação](https://pnpm.io/pt/installation)
    -   Usar PNPM para instalar pacotes
    -   usar npx prisma generate na primeira vez com o banco de dados funcionando
        atualmente: npx prisma generate --schema=prisma/mongodb/schema.prisma (mongo)
        e npx prisma generate --schema=prisma/schema.prisma (postgres)
    -   usar npx prisma migrate dev para atualizar o banco

**Para rodar:**

-   Colocar .env
-   `pnpm run start:dev`

### Ubuntu

-   **Banco de Dados Local:**
    -   Instalar Docker Engine: [Guia de Instalação](https://docs.docker.com/engine/install/ubuntu/)
    -   Instalar Docker Compose: [Guia de Instalação](https://docs.docker.com/compose/install/linux/)

**Para rodar:**

-   `docker compose up`
-   **Back-end:**
    -   Colocar .env
    -   Instalar ASDF (precisa instalar antes Git e Curl) e adicioná-lo ao shell: [Guia de Instalação](https://asdf-vm.com/pt-br/guide/getting-started.html)
    -   Instalar PNPM: [Guia de Instalação](https://pnpm.io/pt/installation)
    -   Usar PNPM para instalar pacotes
    -   usar npx prisma generate na primeira vez com o banco de dados funcionando
        atualmente: npx prisma generate --schema=prisma/mongodb/schema.prisma (mongo)
        e npx prisma generate --schema=prisma/schema.prisma (postgres)
    -   usar npx prisma migrate dev para atualizar o banco

**Para rodar:**

-   `pnpm run start:dev`

Para gerar novas senhas JWT no caso de vazamento (lembrar de apagar os arquivos)

openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key

openssl base64 -in private.key -out private.key.base64
openssl base64 -in public.key -out public.key.base64

para bug nos containers
docker stop $(docker ps -aq) &&
docker rm $(docker ps -aq) &&
docker-compose down -v &&
docker volume prune -f &&
docker-compose up --build

login e senha no localhost mongo-express - "admin" e "pass"

chave do authorization mongo replica

openssl rand -base64 756 | tr -d '\n' > chave.txt
chmod 600 chaveRSA

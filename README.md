# API ⇒ para integração dos sistemas

## Dicas de Acesso

### Downloads e Configurações Iniciais

### Ferramentas:

- **Bancos:**
    - PostgreSQL (relacional)
    - Redis (cache)
    - DigitalOcean (storage)
- **Back end:**
    - Node.js
    - Nest.js
    - [Prisma.io](http://prisma.io/)

### Windows

- **Banco de Dados Local:**
    - Instalar WSL 2: [Guia de Instalação](https://learn.microsoft.com/pt-br/windows/wsl/install)
    - Instalar Ubuntu no WSL 2: Baixar na Microsoft Store e resetar o PC
    - Instalar Docker Desktop: [Guia de Instalação](https://docs.docker.com/desktop/install/windows-install/)

**Para rodar:**

- Baixar imagens do PostgreSQL e Redis
- Iniciar com os valores das variáveis do env
- Conectar em Settings -> Integrations o Ubuntu rodando ao Docker
- Rodar primeiro Redis e depois PostgreSQL
- **Back-end:**
    - Colocar .env
    - Instalar NVM: [Guia de Instalação](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/)
    - Instalar PNPM: [Guia de Instalação](https://pnpm.io/pt/installation)
    - Usar PNPM para instalar pacotes

**Para rodar:**

- Colocar .env
- `pnpm run start:dev`

### Ubuntu

- **Banco de Dados Local:**
    - Instalar Docker Engine: [Guia de Instalação](https://docs.docker.com/engine/install/ubuntu/)
    - Instalar Docker Compose: [Guia de Instalação](https://docs.docker.com/compose/install/linux/)

**Para rodar:**

- `docker compose up`
- **Back-end:**
    - Colocar .env
    - Instalar ASDF (precisa instalar antes Git e Curl) e adicioná-lo ao shell: [Guia de Instalação](https://asdf-vm.com/pt-br/guide/getting-started.html)
    - Instalar PNPM: [Guia de Instalação](https://pnpm.io/pt/installation)
    - Usar PNPM para instalar pacotes

**Para rodar:**

- `pnpm run start:dev`
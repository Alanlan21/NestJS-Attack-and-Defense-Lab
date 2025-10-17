# AAA Security Project with Controlled Attacks
Projeto focado em construir uma API REST segura com NestJS, implementando de forma prática os três pilares da segurança da informação (AAA): Authentication, Authorization e Accountability.

Além de oferecer um CRUD completo de usuários, a API foi desenhada para validar suas defesas contra ataques controlados, observando como a arquitetura reage para detectar, bloquear e registrar atividades maliciosas.

## ✨ Principais recursos
- Autenticação via JWT com algoritmo RS256 (chaves pública/privada).
- Autorização baseada em perfis de acesso (`admin`, `user`).
- Accountability (auditoria) com logging detalhado de ações críticas (logins, falhas, alterações, bloqueios).
- Validação de entrada rigorosa para reduzir superfícies de ataque.
- CRUD completo de usuários: cadastro, login, listagem, edição e remoção.

## ⚔️ Ataques controlados planejados
O sistema é preparado para ser testado diante de cenários comuns:
- **Brute Force**: tentativas massivas de login com Hydra.
- **SQL Injection**: exploração de entradas utilizando sqlmap.
- **Token Manipulation**: adulteração de payload/assinatura JWT com jwt_tool.

## 🧰 Pré-requisitos
- Node.js 18+ e PNPM instalados na máquina (`npm install -g pnpm`).
- PostgreSQL 13+ acessível (local ou container).
- OpenSSL (ou ferramenta equivalente) para geração das chaves RSA.
- Docker (opcional) caso prefira executar a aplicação em container.

## ⚙️ Configuração inicial
1. **Clonar o repositório**
   ```bash
   git clone <https://github.com/Alanlan21/NestJS-Attack-and-Defense-Lab.git>
   cd cybersec
   ```

2. **Instalar dependências**
   ```bash
   pnpm install
   ```

3. **Configurar variáveis de ambiente**  
   Copie o arquivo `.env` fornecido ou crie um novo a partir do template abaixo:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=admin
   DB_DATABASE=cybersec_project_db

   JWT_PRIVATE_KEY_PATH=keys/private.pem
   JWT_PUBLIC_KEY_PATH=keys/public.pem
   JWT_EXPIRATION_TIME=1h
   ```
   Ajuste os valores conforme seu ambiente (principalmente as credenciais do banco).

4. **Gerar chaves RSA**  
   Caso ainda não existam chaves, crie-as no diretório `keys/` (respeitando os caminhos utilizados no `.env`):
   ```bash
   mkdir -p keys
   openssl genrsa -out keys/private.pem 2048
   openssl rsa -in keys/private.pem -pubout -out keys/public.pem
   ```
   > Em ambientes onde não seja viável montar arquivos, você pode definir `JWT_PRIVATE_KEY` e `JWT_PUBLIC_KEY` diretamente no `.env` (com quebras de linha escapadas).

5. **Criar o banco de dados**  
   Garanta que o banco apontado no `.env` exista e esteja acessível. Em desenvolvimento o TypeORM está com `synchronize` habilitado, portanto as tabelas serão criadas automaticamente no primeiro start.

## 🚀 Executando a API em desenvolvimento
1. Suba o PostgreSQL localmente ou via container (exemplo com Docker):
   ```bash
   docker run --name cybersec-db -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=cybersec_project_db \
     -p 5432:5432 -d postgres:16
   ```

2. Execute a aplicação em modo watch:
   ```bash
   pnpm run start:dev
   ```
   A API ficará disponível em `http://localhost:3000`.

## 👤 Criando o administrador inicial
Use o script `bootstrap-admin` para registrar um usuário administrador sem passar pelo fluxo de cadastro:
```bash
INITIAL_ADMIN_EMAIL=admin@example.com \
INITIAL_ADMIN_PASSWORD=SenhaForte123! \
pnpm run bootstrap:admin
```
O script é idempotente: ao rodá-lo novamente com o mesmo e-mail, nada será recriado.

## 🧪 Testes
- Testes unitários/integrados: `pnpm run test`
- Watch mode: `pnpm run test:watch`
- Cobertura: `pnpm run test:cov`

## 📦 Build e produção
1. Gerar artefatos compilados:
   ```bash
   pnpm run build
   ```
2. Executar a versão compilada:
   ```bash
   pnpm run start:prod
   ```

## 🐳 Executando via Docker
1. Construa a imagem:
   ```bash
   docker build -t cybersec-api .
   ```
2. Rode o container (certifique-se de apontar `DB_HOST` para o endereço correto do Postgres):
   ```bash
   docker run --env-file .env \
     -p 3000:3000 \
     --name cybersec-api \
     cybersec-api
   ```
   > Em produção, recomenda-se montar ou injetar as chaves RSA via variáveis de ambiente seguras.

## 🛠️ Stack técnica
- **Backend**: NestJS + TypeORM
- **Banco**: PostgreSQL
- **Autenticação**: JWT (RS256)
- **Ambiente**: Node 18 / Docker

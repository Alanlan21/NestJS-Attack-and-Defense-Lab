# 🚀 Setup Completo - NestJS Attack & Defense Lab

Guia passo-a-passo para rodar o projeto localmente.

## 📋 Pré-requisitos

- **Node.js 18+** ([Download](https://nodejs.org/))
- **PNPM** (`npm install -g pnpm`)
- **Docker** (opcional, para banco de dados)
- **Python 3.8+** (opcional, para scripts de ataque)
- **Git**

---

## ⚡ Instalação Rápida

### 1. Clone o Repositório

```bash
git clone https://github.com/Alanlan21/NestJS-Attack-and-Defense-Lab.git
cd NestJS-Attack-and-Defense-Lab
```

### 2. Instale Dependências

**Backend:**

```bash
pnpm install
```

**Frontend:**

```bash
cd frontend
npm install
cd ..
```

**Scripts Python (opcional):**

```bash
pip install requests
```

### 3. Configure o Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env se necessário (valores padrão já funcionam)
```

### 4. Gere Chaves JWT

```bash
# Crie diretório
mkdir keys

# Gere chave privada
openssl genrsa -out keys/private.pem 2048

# Gere chave pública
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

**Problema com OpenSSL no Windows?**

- Instale Git Bash e use o terminal Git Bash
- Ou use WSL: `wsl openssl genrsa -out keys/private.pem 2048`

### 5. Inicie o Banco de Dados

**Opção A - Docker (Recomendado):**

```bash
docker run --name cybersec-db \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=cybersec_project_db \
  -p 5432:5432 \
  -d postgres:16
```

**Opção B - PostgreSQL Local:**

- Instale PostgreSQL 13+
- Crie banco: `CREATE DATABASE cybersec_project_db;`
- Ajuste credenciais no `.env`

### 6. Inicie o Backend

```bash
# Terminal 1
pnpm start:dev

# Aguarde até ver: "Application is running on: http://localhost:3000"
```

### 7. Crie Usuário Admin

```bash
# Terminal 2 (novo terminal)
pnpm run bootstrap:admin

# Sucesso: ✅ Admin user created successfully!
```

**Credenciais padrão:**

- Email: `admin@example.com`
- Senha: `Admin@123456`

### 8. Inicie o Frontend

```bash
# Terminal 3 (novo terminal)
cd frontend
npm run dev

# Abra: http://localhost:5173
```

### 9. Faça Login

1. Acesse `http://localhost:5173`
2. Login: `admin@example.com`
3. Senha: `Admin@123456`
4. Dashboard deve carregar com métricas

---

## 🐳 Usando Docker Compose (Alternativa)

```bash
# Gere as chaves JWT primeiro (passo 4 acima)

# Suba tudo com um comando
docker-compose up

# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# PostgreSQL: localhost:5432

# Criar admin (em outro terminal)
docker exec -it api-cybersec-project npm run bootstrap:admin
```

---

## 🧪 Testando o Sistema

### Executar Ataques

```bash
cd scripts/attacks

# SQL Injection
python sql-injection.py

# Brute Force
python brute-force.py

# XSS
python xss-attack.py

# Path Traversal
python path-traversal.py

# Multi-IP
python multi-ip-attack.py
```

### Ver Resultados

1. Abra o dashboard: `http://localhost:5173`
2. Observe as métricas atualizarem em tempo real
3. Clique em eventos para ver detalhes

---

## 🆘 Troubleshooting

### Backend não inicia

**Erro: `Error: ENOENT: no such file or directory, open 'keys/private.pem'`**

Solução: Gere as chaves JWT (passo 4)

**Erro: `Connection to database failed`**

Solução: Verifique se PostgreSQL está rodando na porta 5432

```bash
# Teste a conexão
docker ps | grep postgres
# ou
psql -h localhost -U postgres -d cybersec_project_db
```

### Frontend não conecta

**Erro: `Network Error` ou `CORS blocked`**

Solução: Backend precisa estar rodando em `http://localhost:3000`

Verifique CORS em `src/main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:5173'],
  credentials: true,
});
```

### Admin não foi criado

**Erro: `User already exists`**

Isso é normal se já rodou o script antes. Use as credenciais existentes.

**Erro: `Database connection failed`**

Solução: Backend precisa estar conectado ao banco antes de criar admin

### Scripts Python não funcionam

**Erro: `ModuleNotFoundError: No module named 'requests'`**

```bash
pip install requests
```

**Erro: `Connection refused`**

Backend não está rodando. Inicie com `pnpm start:dev`

---

## 📦 Estrutura de Portas

| Serviço    | Porta | URL                   |
| ---------- | ----- | --------------------- |
| Backend    | 3000  | http://localhost:3000 |
| Frontend   | 5173  | http://localhost:5173 |
| PostgreSQL | 5432  | localhost:5432        |

---

## 🔄 Resetar Ambiente

```bash
# Parar todos os serviços
# Ctrl+C nos terminais

# Remover banco Docker
docker stop cybersec-db
docker rm cybersec-db

# Limpar node_modules (se necessário)
rm -rf node_modules frontend/node_modules
pnpm install
cd frontend && npm install
```

---

## ✅ Checklist de Verificação

- [ ] Node.js 18+ instalado
- [ ] PNPM instalado globalmente
- [ ] Dependências instaladas (backend + frontend)
- [ ] Arquivo `.env` criado
- [ ] Chaves JWT geradas (`keys/private.pem`, `keys/public.pem`)
- [ ] PostgreSQL rodando (Docker ou local)
- [ ] Backend iniciado (`http://localhost:3000`)
- [ ] Admin criado
- [ ] Frontend iniciado (`http://localhost:5173`)
- [ ] Login funcionando
- [ ] Dashboard carregando dados

---

## 📚 Próximos Passos

Após setup completo:

1. Leia o [README.md](./README.md) para visão geral
2. Execute scripts de ataque e observe dashboard
3. Explore endpoints na documentação
4. Customize detecção em `src/security/detection/`

**Dúvidas?** Abra uma issue no GitHub!

# 🛡️ CyberSec Lab - Attack & Defense Platform

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Full-stack Security Operations Center (SOC) demonstrando defesa multicamadas contra ataques reais**

[🎯 Demo](#-demonstração) • [🏗️ Arquitetura](#️-arquitetura) • [⚡ Quick Start](#-quick-start)

</div>

---

## 🎯 Sobre o Projeto

Plataforma educacional de cibersegurança que implementa **Red Team vs Blue Team** em um ambiente controlado. Desenvolvido como projeto acadêmico baseado no **CyBOK** (Cyber Security Body of Knowledge), demonstra na prática:

- 🔴 **Offensive Security:** 136+ payloads reais de ataque
- 🔵 **Defensive Security:** 7 camadas de proteção automatizada
- 📊 **Security Operations:** SOC Dashboard em tempo real
- 🤖 **Automated Response:** Sistema SOAR simplificado

### 💡 Problema Resolvido

Aplicações web modernas enfrentam **milhares de tentativas de ataque diariamente**. Este projeto demonstra como implementar defesa em profundidade (Defense in Depth) com:

- ✅ Detecção automática de 5 vetores de ataque comuns
- ✅ Bloqueio inteligente baseado em scoring de ameaças
- ✅ Monitoramento visual em tempo real
- ✅ Resposta automatizada sem intervenção humana

---

## ✨ Destaques Técnicos

### 🛡️ Security Features

```typescript
// Authentication: JWT RS256 (assinatura assimétrica)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ANALYST)
async getDashboard() { ... }

// Threat Intelligence: Scoring dinâmico
if (threatScore >= 100) {
  await this.blockIp(ip, 'AUTO_BLOCKED');
}

// Detection: 18 regex patterns com confidence scoring
const confidence = (matches.length / totalPatterns) * 100;
if (confidence >= 60) block();
```

### 📊 Métricas do Sistema

| Categoria               | Implementação                              | Taxa de Sucesso              |
| ----------------------- | ------------------------------------------ | ---------------------------- |
| **SQL Injection**       | 29 payloads (Union, Boolean, Time-based)   | 100% bloqueio                |
| **XSS**                 | 22 payloads (Reflected, Stored, DOM-based) | 70-80% bloqueio              |
| **Path Traversal**      | 33 payloads (LFI, RFI, Command Injection)  | 90-100% bloqueio             |
| **Brute Force**         | 52 senhas + rate limiting                  | Auto-block após 5 tentativas |
| **Threat Intelligence** | Scoring dinâmico + decay 10%/dia           | ≥100pts = permanente block   |

### 🎨 Frontend Dashboard

- **Real-time Updates:** Polling a cada 5 segundos
- **Visualizações:** Métricas, Timeline (60min), Top Threats, Live Events
- **Interatividade:** Modal de detalhes, Reset Demo, Filtros
- **Responsivo:** TailwindCSS + Recharts para gráficos

---

## 🏗️ Arquitetura

**Defense in Depth:** 7 camadas redundantes garantem proteção mesmo se uma falhar

### Fluxo de Defesa

```
🎯 ATACANTE (136+ Payloads)
        ↓
┌─────────────────────────────────┐
│  1️⃣ WAF MIDDLEWARE              │ ←──┐
│  • Bloqueio: 90%                │    │ Consulta Blocklist
│  • analyzeRequest()             │    │
│  • isIpBlocked()                │    │
└────────┬────────────────────────┘    │
         │ Malicious                   │
         ▼                              │
┌─────────────────────────────────┐    │
│  2️⃣ DETECTION SERVICE            │    │
│  • 18 regex patterns            │    │
│  • Confidence ≥60% → BLOCK      │    │
│  • detectSQL() detectXSS()      │    │
└────────┬────────────────────────┘    │
         │ Report Attack               │
         ▼                              │
┌─────────────────────────────────┐    │
│  3️⃣ THREAT INTELLIGENCE          │────┘
│  • Scoring dinâmico             │ Update Blocklist
│  • Score ≥100pts → AUTO-BLOCK   │
│  • Decay -10%/dia               │
└────────┬────────────────────────┘
         │ Clean Request (<60% conf)
         ▼
┌─────────────────────────────────┐
│  4️⃣ AUTH GUARDS                  │
│  • JwtAuthGuard (token válido?) │
│  • RolesGuard (permissão?)      │
│  • RS256 validation             │
└────────┬────────────────────────┘
         │ Authorized
         ▼
┌─────────────────────────────────┐
│  5️⃣ APPLICATION LOGIC            │
│  • Controllers                  │
│  • Services                     │
│  • DTOs                         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  6️⃣ DATABASE LAYER (PostgreSQL 16 + TypeORM)        │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │SecurityEvent │ │ ThreatActor  │ │IpBlocklist  │ │
│  │• attackType  │ │• ipAddress   │ │• ip         │ │
│  │• sourceIp    │ │• threatScore │ │• active     │ │
│  │• blocked     │ │• isBlocked   │ │• expires    │ │
│  └──────────────┘ └──────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────┘

      🍯 HONEYPOTS (lateral)
      • /admin, /phpmyadmin
      • /.env, /wp-admin
      └─→ Injeta +5pts Threat Score
```

---

## 🚀 Quick Start

### Opção 1: Docker (Recomendado)

```bash
git clone https://github.com/Alanlan21/NestJS-Attack-and-Defense-Lab.git
cd NestJS-Attack-and-Defense-Lab

# Inicia backend + frontend + database
docker-compose up -d

# Cria usuário admin
docker exec -it cybersec-backend pnpm run bootstrap:admin

# Acesse: http://localhost:5173
# Login: admin@example.com / Admin@123456
```

### Opção 2: Local

```bash
# 1. Clone e instale dependências
git clone https://github.com/Alanlan21/NestJS-Attack-and-Defense-Lab.git
cd NestJS-Attack-and-Defense-Lab
pnpm install

# 2. Configure ambiente
cp .env.example .env

# 3. Gere chaves JWT
mkdir keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# 4. PostgreSQL (Docker)
docker run -d --name cybersec-db \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=cybersec_project_db \
  -p 5432:5432 postgres:16

# 5. Inicie backend
pnpm start:dev

# 6. Inicie frontend (novo terminal)
cd frontend && npm install && npm run dev
```

---

## 🧪 Demonstração

### 1️⃣ Login no Dashboard SOC

```bash
# Acesse: http://localhost:5173
# Credenciais: admin@example.com / Admin@123456
```

### 2️⃣ Execute Ataques Simulados

```bash
cd scripts/attacks

# SQL Injection (29 payloads diferentes)
python sql-injection.py --target login

# Brute Force (50 senhas comuns)
python brute-force.py

# Multi-IP (ataque distribuído)
python multi-ip-attack.py --mode distributed
```

### 3️⃣ Observe o Dashboard

- 📊 **Métricas** sobem em tempo real
- 📈 **Timeline** mostra picos de atividade
- 🎯 **Top Threats** lista IPs maliciosos
- 🔴 **Live Events** stream de tentativas bloqueadas

---

## 🛠️ Stack Tecnológica

### Backend

- **Framework:** NestJS 10 (Node.js)
- **Language:** TypeScript 5
- **Database:** PostgreSQL 16 + TypeORM
- **Auth:** JWT (RS256 - assinatura assimétrica)
- **Security:** Custom WAF, Pattern Matching IDS, Threat Intelligence

### Frontend

- **Library:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Styling:** TailwindCSS 3
- **Charts:** Recharts
- **Icons:** Lucide React

### DevOps

- **Containerization:** Docker + Docker Compose
- **Orchestration:** PNPM workspaces
- **Testing:** Python 3 (attack scripts)

---

## 📚 Conceitos Aplicados

Este projeto implementa boas práticas recomendadas pelo **CyBOK** e **CISSP**:

### AAA (Authentication, Authorization, Accountability)

- ✅ **Authentication:** JWT RS256 stateless com bcrypt (10 salt rounds)
- ✅ **Authorization:** RBAC com 3 roles (ADMIN, ANALYST, USER)
- ✅ **Accountability:** Logging completo com timestamp, IP, payload, outcome

### Defense in Depth

- ✅ **Perimeter:** WAF + Rate Limiting
- ✅ **Network:** IP Blocklist + Threat Intelligence
- ✅ **Application:** Auth Guards + Input Validation
- ✅ **Data:** PostgreSQL constraints + Prepared Statements
- ✅ **Deception:** Honeypots (10+ endpoints falsos)

### OWASP Top 10 Coverage

- ✅ A01 - Broken Access Control (RBAC + Guards)
- ✅ A02 - Cryptographic Failures (JWT RS256, bcrypt)
- ✅ A03 - Injection (SQL, XSS, Path Traversal detection)
- ✅ A05 - Security Misconfiguration (Environment variables)
- ✅ A07 - Identification & Auth Failures (Brute force protection)

---


## ⚠️ Aviso de Segurança

**Este é um projeto EDUCACIONAL.**

❌ **NÃO usar em produção sem:**

- Gerar novas chaves JWT únicas
- Configurar secrets em vault (não em .env)
- Implementar rate limiting global
- Adicionar HTTPS/TLS
- Configurar CORS adequadamente
- Revisar todas as credenciais

---

<div align="center">

⭐ **Se este projeto te ajudou, considere dar uma estrela!** ⭐

**Desenvolvido com** ❤️ **como parte da disciplina de Cybersegurança do curso de Análise e Desenvolvimento de Sistemas na UNIFOR**

</div>

# 🛡️ NestJS Attack & Defense Lab with SOC

> **Projeto Acadêmico de Cibersegurança baseado no CyBOK**
>
> Laboratório completo de Segurança Ofensiva (Red Team) e Defensiva (Blue Team) com foco em **Malware & Attack Technologies** e **Security Operations & Incident Management**.

---

## 📋 Visão Geral

Este projeto implementa um **Security Operations Center (SOC) em miniatura** integrado a uma API REST segura, demonstrando na prática:

### 🔴 **Red Team (Offensive Security)**

- Scripts de ataque automatizados (Brute Force, SQL Injection, XSS)
- Técnicas de evasão de defesas
- Honeypots para engenharia reversa de atacantes

### 🔵 **Blue Team (Defensive Security)**

- **WAF** (Web Application Firewall) com pattern matching
- **IDS/IPS** (Intrusion Detection/Prevention System)
- **Threat Intelligence** com scoring dinâmico de IPs
- **SOC Dashboard** para monitoramento em tempo real
- **Resposta Automatizada** a incidentes

---

## ✨ Principais Recursos

### Segurança (AAA + Defense in Depth)

- ✅ **Authentication:** JWT com RS256 (chaves pública/privada)
- ✅ **Authorization:** RBAC (Role-Based Access Control)
- ✅ **Accountability:** Logging detalhado de eventos de segurança
- ✅ **WAF:** Bloqueio automático de requisições maliciosas
- ✅ **IDS/IPS:** Detecção e prevenção de intrusões
- ✅ **Threat Intelligence:** Scoring de IPs maliciosos
- ✅ **Honeypots:** Endpoints falsos para coletar inteligência

### Detecção de Ataques

- 🛡️ **SQL Injection** (union, boolean, time-based, error-based)
- 🛡️ **Cross-Site Scripting (XSS)**
- 🛡️ **Path Traversal**
- 🛡️ **Brute Force**
- 🛡️ **Rate Limiting Abuse**
- 🛡️ **Token Manipulation**

### Monitoramento e Resposta

- 📊 **Dashboard de Segurança** (métricas em tempo real)
- 🚨 **Alertas Automáticos** baseados em threat level
- 🔒 **Auto-blocking** de IPs com score crítico
- 📈 **Threat Scoring** com decay automático
- 📋 **Relatórios de Incidentes**

---

## 🏗️ Arquitetura

```
┌─────────────┐
│  Attacker   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         WAF Middleware              │
│  • Pattern Matching                 │
│  • IP Blocklist Check               │
│  • Rate Limiting                    │
└──────┬──────────────────────────────┘
       │ (clean) ──────► [Application]
       │
       │ (malicious)
       ▼
┌─────────────────────────────────────┐
│      Detection Service              │
│  • SQL Injection Detection          │
│  • XSS Detection                    │
│  • Path Traversal Detection         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Threat Intelligence              │
│  • Threat Scoring                   │
│  • Auto-blocking (score >= 100)     │
│  • Score Decay (10%/day)            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Security Events DB               │
│  • Event Logging                    │
│  • Threat Actors                    │
│  • IP Blocklist                     │
└─────────────────────────────────────┘
```

---

## ⚔️ Vetores de Ataque Implementados

O sistema pode ser testado contra:

| Tipo de Ataque         | Script             | Detecção | Bloqueio       |
| ---------------------- | ------------------ | -------- | -------------- |
| **Brute Force**        | `brute-force.py`   | ✅       | ✅             |
| **SQL Injection**      | `sql-injection.py` | ✅       | ✅             |
| **XSS**                | `sql-injection.py` | ✅       | ✅             |
| **Path Traversal**     | Manual             | ✅       | ✅             |
| **Token Manipulation** | `jwt_tool`         | ✅       | ✅             |
| **Honeypot Access**    | Qualquer tool      | ✅       | ⚠️ (logs only) |

---

## 🧰 Pré-requisitos

### Backend

- Node.js 18+ e PNPM instalados (`npm install -g pnpm`)
- PostgreSQL 13+ (local ou Docker)
- OpenSSL (para geração de chaves RSA)

### Scripts de Ataque (Opcional)

- Python 3.8+
- Biblioteca `requests`: `pip install requests`

---

## 🚀 Quick Start

```bash
# 1. Clone e instale
git clone https://github.com/Alanlan21/NestJS-Attack-and-Defense-Lab.git
cd NestJS-Attack-and-Defense-Lab
pnpm install

# 2. Configure .env (copie de .env.example)
cp .env.example .env

# 3. Gere chaves RSA
mkdir keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# 4. Suba o banco
docker run --name cybersec-db -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=cybersec_project_db -p 5432:5432 -d postgres:16

# 5. Inicie a API
pnpm start:dev

# 6. Crie admin (em outro terminal)
INITIAL_ADMIN_EMAIL=admin@example.com INITIAL_ADMIN_PASSWORD=Admin@123456 pnpm run bootstrap:admin
```

**Variáveis importantes no `.env`:**

- `WAF_MODE=test` - Apenas loga ataques (use `production` para bloqueio real)
- `DB_PASSWORD=admin` - Senha do PostgreSQL
- `JWT_EXPIRATION_TIME=1h` - Validade do token

---

## 🧪 Testando o Sistema

**Scripts Python:**

```bash
# SQL Injection
python scripts/attacks/sql-injection.py --target login

# Brute Force
python scripts/attacks/brute-force.py --email admin@example.com
```

**Via curl:**

```bash
# Teste SQL Injection
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"admin'\'' OR 1=1--","password":"test"}'

# Honeypot
curl http://localhost:3000/admin

# Dashboard (requer token admin)
curl http://localhost:3000/monitoring/dashboard -H "Authorization: Bearer <token>"
```



## 🛡️ Como Funciona

**Threat Scoring:**

```
SQL_INJECTION: 25 pts | XSS: 20 pts | BRUTE_FORCE: 10 pts
Score >= 100 → Auto-block
Decay: -10%/dia (cron job)
```

**Detection Patterns:**

- SQL: `' OR 1=1`, `UNION SELECT`, `DROP TABLE`
- XSS: `<script>`, `javascript:`, `onerror=`
- Path Traversal: `../`, `%2e%2e/`

**Request Flow:**

```
Cliente → WAF → Detection → Threat Intel → App
          ↓       ↓            ↓
       Block   Log Event   Auto-block
```

---

## 📚 Documentação Completa

Para arquitetura detalhada, algoritmos e uso avançado:

📄 **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Documentação técnica completa  
🎯 **[APRESENTACAO.md](./APRESENTACAO.md)** - Roteiro de apresentação do projeto

---

## 🛠️ Stack Técnica

**Backend:** NestJS 10 • TypeORM • PostgreSQL 16 • JWT RS256  
**Security:** Custom WAF • Pattern Matching IDS • Threat Intelligence  
**Tools:** Python 3 • Docker • OpenSSL

---

## 🔒 Avisos Importantes

⚠️ **Projeto educacional** - Não use em produção sem hardening adicional  
⚠️ **Scripts de ataque** - Apenas em ambientes autorizados  
⚠️ **CyBOK compliance** - Foco em Malware & Attack Technologies + Security Operations

**Melhorias para produção:**

- Rate limiting com Redis
- SIEM real (ELK/Splunk)
- ML para anomalias
- Threat feeds externos
- MFA + HTTPS obrigatório

---

## 📖 Referências

- [CyBOK](https://www.cybok.org/) - Cyber Security Body of Knowledge
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Vulnerabilidades web
- [MITRE ATT&CK](https://attack.mitre.org/) - Tactics & Techniques
- [NestJS Security](https://docs.nestjs.com/security/) - Framework security best practices

---



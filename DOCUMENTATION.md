# 🛡️ NestJS Attack & Defense Lab with SOC

## 📋 Visão Geral do Projeto

Este projeto é um laboratório completo de **Segurança Ofensiva e Defensiva**, desenvolvido como trabalho acadêmico baseado no **CyBOK (Cyber Security Body of Knowledge)**, focado nas áreas:

- **Malware & Attack Technologies** (System Security)
- **Security Operations & Incident Management** (System Security)

O sistema demonstra na prática como construir e testar defesas contra ataques reais, implementando:

### 🔴 Red Team (Ataque)

- Scripts de ataque automatizados
- Vetores de ataque comuns (Brute Force, SQL Injection, XSS, etc.)
- Técnicas de evasão
- Honeypots para coletar inteligência

### 🔵 Blue Team (Defesa)

- **IDS/IPS** (Intrusion Detection/Prevention System)
- **WAF** (Web Application Firewall)
- **Threat Intelligence** com scoring dinâmico
- **SOC Dashboard** para monitoramento
- **Resposta automatizada** a incidentes

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     CAMADA DE APLICAÇÃO                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Users   │  │  Admin   │  │Honeypots │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAMADA DE SEGURANÇA (WAF)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WAF Middleware                                       │  │
│  │  • Pattern Matching (SQL Injection, XSS, etc)       │  │
│  │  • IP Blocklist Check                               │  │
│  │  • Rate Limiting                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  DETECTION & RESPONSE LAYER                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Detection   │  │   Threat     │  │  Monitoring  │     │
│  │   Service    │  │ Intelligence │  │   Service    │     │
│  │              │  │              │  │              │     │
│  │ • SQL Inj    │  │ • IP Scoring │  │ • Dashboard  │     │
│  │ • XSS        │  │ • Auto-block │  │ • Metrics    │     │
│  │ • Path Trav  │  │ • Decay      │  │ • Alerts     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Security   │  │   Threat     │  │      IP      │     │
│  │    Events    │  │    Actors    │  │   Blocklist  │     │
│  │              │  │              │  │              │     │
│  │ PostgreSQL   │  │ PostgreSQL   │  │ PostgreSQL   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Áreas do CyBOK Cobertas

### 1. **Malware & Attack Technologies**

**Implementação Prática:**

- **Vetores de Ataque Simulados:**
  - Brute Force attacks
  - SQL Injection (union, boolean, time-based)
  - Cross-Site Scripting (XSS)
  - Path Traversal
  - Token Manipulation

- **Honeypots:**
  - Endpoints falsos (`/admin`, `/phpmyadmin`, `.env`)
  - Respostas convincentes para enganar atacantes
  - Coleta de inteligência sobre táticas

- **Scripts de Ataque Controlado:**
  - `brute-force.py` - Simula ataques de força bruta
  - `sql-injection.py` - Testa vulnerabilidades SQL
  - Técnicas de evasão (encoding, case manipulation)

### 2. **Security Operations & Incident Management**

**Implementação Prática:**

- **Detection (IDS):**
  - Pattern matching para SQL Injection, XSS, Path Traversal
  - Confidence scoring baseado em múltiplos indicadores
  - Logging estruturado de eventos de segurança

- **Prevention (IPS):**
  - WAF que bloqueia requisições maliciosas automaticamente
  - IP blocklisting dinâmica
  - Rate limiting

- **Threat Intelligence:**
  - Threat scoring por IP
  - Classificação de risco (LOW, MEDIUM, HIGH, CRITICAL)
  - Auto-blocking de IPs com score crítico
  - Decay automático de scores (reduz falsos positivos)

- **Incident Response:**
  - Detecção → Logging → Scoring → Blocking (automático)
  - Dashboard de monitoramento em tempo real
  - Métricas e KPIs de segurança

- **SOC Dashboard:**
  - Visualização de eventos recentes
  - Top threat actors
  - Timeline de ataques (24h)
  - Estatísticas por tipo e severidade

---

## 📊 Entidades do Sistema

### SecurityEvent

Registra cada evento de segurança detectado.

```typescript
{
  id: UUID;
  attackType: AttackType; // BRUTE_FORCE, SQL_INJECTION, etc
  threatLevel: ThreatLevel; // LOW, MEDIUM, HIGH, CRITICAL
  sourceIp: string;
  userAgent: string;
  endpoint: string;
  method: string;
  payload: JSON;
  blocked: boolean;
  confidence: number;
  detectedAt: timestamp;
  metadata: JSON;
}
```

### ThreatActor

Perfil de cada IP com histórico de atividades maliciosas.

```typescript
{
  id: UUID
  ipAddress: string (unique)
  threatScore: number
  riskLevel: ThreatLevel
  attackCount: number
  attackTypes: string[]
  lastActivity: timestamp
  firstSeen: timestamp
  isBlocked: boolean
  metadata: JSON
}
```

### IpBlocklist

Lista de IPs bloqueados com expiração opcional.

```typescript
{
  id: UUID;
  ipAddress: string(unique);
  reason: string;
  active: boolean;
  expiresAt: timestamp(nullable);
  blockedBy: string;
  createdAt: timestamp;
}
```

---

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Detecção

- **SQL Injection Detection**
  - Union-based attacks
  - Boolean-based blind
  - Time-based blind
  - Error-based
  - Stacked queries
- **XSS Detection**
  - Script tags
  - Event handlers
  - JavaScript URIs
  - IFrames e objetos maliciosos

- **Path Traversal Detection**
  - Directory traversal patterns
  - URL encoding detection

### ✅ Web Application Firewall (WAF)

- Middleware global aplicado em todas as rotas
- Análise em tempo real de requisições
- Bloqueio automático baseado em confiança
- Integração com Threat Intelligence
- Exceções para honeypots (para coletar intel)

### ✅ Threat Intelligence

- **Threat Scoring Algorithm:**

  ```
  Score = Σ(Attack_Type_Score × Frequency)

  Attack Scores:
  - BRUTE_FORCE: 10
  - SQL_INJECTION: 25
  - XSS: 20
  - TOKEN_MANIPULATION: 30
  - IDOR: 15
  - RATE_LIMIT: 5
  - SUSPICIOUS: 10
  ```

- **Auto-blocking:** Score >= 100 → Auto-block
- **Score Decay:** Reduz 10% diariamente (via cron)
- **Cleanup:** Remove entries expiradas automaticamente

### ✅ Honeypots

Endpoints falsos que parecem vulneráveis:

- `/admin`, `/administrator` - Painel administrativo falso
- `/phpmyadmin`, `/db` - Interface de banco falsa
- `/.env`, `/config.json` - Arquivos sensíveis falsos
- `/debug`, `/test` - Endpoints de desenvolvimento falsos

Todos os acessos são registrados com threatScore aumentado.

### ✅ Monitoring Dashboard

**Endpoint:** `GET /monitoring/dashboard` (Admin only)

Retorna métricas em tempo real:

```json
{
  "totalEvents": 1234,
  "blockedEvents": 456,
  "attacksByType": {
    "SQL_INJECTION": 320,
    "BRUTE_FORCE": 180,
    "XSS": 95
  },
  "threatsByLevel": {
    "CRITICAL": 12,
    "HIGH": 45,
    "MEDIUM": 230
  },
  "topThreats": [
    {
      "ip": "192.168.1.100",
      "score": 250,
      "attackCount": 45,
      "riskLevel": "CRITICAL"
    }
  ],
  "timeline": [...]
}
```

---

## 🧪 Scripts de Ataque Controlado

### Brute Force Attack

```bash
python scripts/attacks/brute-force.py --email admin@example.com --delay 0.1
```

**Recursos:**

- Lista de senhas comuns (top 20)
- Detecção automática de bloqueio
- Relatório detalhado de resultados
- Teste de rate limiting

### SQL Injection Attack

```bash
python scripts/attacks/sql-injection.py --target all --delay 0.5
```

**Recursos:**

- 20+ payloads comuns de SQLi
- Testes em login e query params
- Técnicas de evasão avançadas
- Taxa de bloqueio pelo WAF

---

## 🔧 Instalação e Configuração

### Pré-requisitos

```bash
# Backend
- Node.js 18+
- pnpm
- PostgreSQL 13+
- OpenSSL

# Scripts de Ataque
- Python 3.8+
- requests library
```

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Alanlan21/NestJS-Attack-and-Defense-Lab.git
cd NestJS-Attack-and-Defense-Lab

# 2. Instale dependências do Node.js
pnpm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Gere chaves RSA
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# 5. Suba o PostgreSQL
docker run --name cybersec-db -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=cybersec_project_db \
  -p 5432:5432 -d postgres:16

# 6. Inicie a aplicação
pnpm run start:dev

# 7. (Opcional) Instale dependências Python para scripts de ataque
pip install requests
```

### Criando Usuário Admin

```bash
INITIAL_ADMIN_EMAIL=admin@example.com \
INITIAL_ADMIN_PASSWORD=Admin@123456 \
pnpm run bootstrap:admin
```

---

## 📝 Endpoints da API

### Autenticação

- `POST /auth/login` - Login de usuários

### Usuários

- `POST /users` - Criar usuário
- `GET /users` - Listar usuários (Admin)
- `GET /users/:id` - Buscar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Remover usuário

### Monitoring (Admin only)

- `GET /monitoring/dashboard` - Dashboard completo
- `GET /monitoring/status` - Status do sistema

### Honeypots (Detectam automaticamente)

- `ANY /admin/*`
- `ANY /phpmyadmin`
- `ANY /.env`
- E outros...

---

## 🧪 Testando o Sistema

### 1. Teste de SQL Injection

```bash
# Via script Python
python scripts/attacks/sql-injection.py --target login

# Via curl
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin'\'' OR 1=1--","password":"test"}'
```

**Resultado esperado:** `403 Forbidden` (bloqueado pelo WAF)

### 2. Teste de Brute Force

```bash
python scripts/attacks/brute-force.py --email admin@example.com --delay 0.1
```

**Resultado esperado:** Bloqueio após threshold de tentativas

### 3. Teste de Honeypot

```bash
curl http://localhost:3000/admin
curl http://localhost:3000/.env
curl http://localhost:3000/phpmyadmin
```

**Resultado esperado:** Resposta 200 com dados falsos + registro de threat

### 4. Visualizar Dashboard

```bash
# 1. Faça login como admin
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}' \
  | jq -r '.access_token')

# 2. Acesse o dashboard
curl http://localhost:3000/monitoring/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 📈 Métricas e KPIs

O sistema rastreia:

- **Detection Rate:** % de ataques detectados
- **False Positive Rate:** Eventos marcados como falso positivo
- **Block Rate:** % de ataques bloqueados
- **Response Time:** Tempo de detecção → bloqueio
- **Threat Score Distribution:** Distribuição de IPs por risco
- **Attack Types Frequency:** Tipos de ataque mais comuns

---

## 🎓 Aspectos Educacionais (CyBOK)

### Malware & Attack Technologies

Este projeto demonstra:

1. **Attack Vectors:** Implementação real de vetores comuns
2. **Attack Patterns:** Reconhecimento de padrões maliciosos
3. **Evasion Techniques:** Como atacantes tentam burlar defesas
4. **Honeypots:** Técnica de deception para coletar intel

### Security Operations & Incident Management

Este projeto demonstra:

1. **Detection Engineering:** Criação de regras de detecção
2. **Incident Response:** Pipeline automático de resposta
3. **Threat Intelligence:** Scoring e tracking de ameaças
4. **Security Monitoring:** Dashboard e métricas em tempo real
5. **Playbooks:** Resposta automatizada baseada em severity

---

## 🔒 Considerações de Segurança

⚠️ **IMPORTANTE:** Este é um projeto educacional

- Use apenas em ambiente controlado
- Não exponha em produção sem hardening adicional
- Scripts de ataque devem ser usados apenas para teste
- Respeite leis e regulamentos locais

### Melhorias para Produção

- [ ] Rate limiting mais sofisticado (Redis)
- [ ] SIEM real (ELK Stack, Splunk)
- [ ] Machine Learning para detecção
- [ ] Integração com threat feeds externos
- [ ] Autenticação multi-fator (MFA)
- [ ] Criptografia de logs sensíveis
- [ ] Backup e disaster recovery
- [ ] WAF baseado em ML

---

## 📚 Referências

- **CyBOK:** https://www.cybok.org/
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **MITRE ATT&CK:** https://attack.mitre.org/
- **NestJS Security:** https://docs.nestjs.com/security/

---

## 👥 Equipe

- Desenvolvimento e Arquitetura
- Pesquisa de Vulnerabilidades
- Análise de Segurança

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais.

---

## 🙏 Agradecimentos

Agradecemos ao professor e à disciplina de Cibersegurança por proporcionar a oportunidade de desenvolver este projeto prático baseado no CyBOK.

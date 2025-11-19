# 🔴 Scripts de Ataque Controlado

Este diretório contém scripts Python para testar o sistema de defesa da aplicação.

⚠️ **USO APENAS PARA FINS EDUCACIONAIS E TESTES AUTORIZADOS**

---

## 📋 Pré-requisitos

```bash
# Python 3.8+
python --version

# Biblioteca requests
pip install requests
```

---

## 🛠️ Scripts Disponíveis

### 1. `brute-force.py` - Ataque de Força Bruta

Simula tentativas massivas de login para testar rate limiting e detecção de brute force.

**Uso básico:**

```bash
python brute-force.py --email admin@example.com --delay 0.1
```

**Opções:**

- `--email`: Email alvo (padrão: `admin@example.com`)
- `--delay`: Delay entre tentativas em segundos (padrão: `0.1`)
- `--test-rate-limit`: Testa rate limiting em vez de brute force

**Exemplos:**

```bash
# Teste rápido de brute force
python brute-force.py --email admin@example.com --delay 0.05

# Teste de rate limiting com burst
python brute-force.py --test-rate-limit

# Brute force lento (para evitar bloqueio rápido)
python brute-force.py --delay 0.5
```

**O que testa:**

- ✅ Detecção de múltiplas tentativas falhas de login
- ✅ Rate limiting
- ✅ Auto-blocking de IPs
- ✅ Threat scoring

**Resultado esperado:**

```
🔴 Iniciando Brute Force Attack
   Target: admin@example.com
   Passwords: 17
   Delay: 0.1s

[1/17] Testing: 123456               | Status: 401
[2/17] Testing: password             | Status: 401
[3/17] Testing: 123456789            | Status: 401
...
[10/17] Testing: admin123            | Status: 401

🚫 BLOQUEADO após 10 tentativas!
   Sistema detectou o ataque e bloqueou o IP

==========================================================
RELATÓRIO DE ATAQUE
==========================================================
Total de tentativas: 10
Sucesso: ❌ NÃO
Bloqueado na tentativa: 10
==========================================================
```

---

### 2. `sql-injection.py` - Ataque SQL Injection

Testa o WAF contra diversos payloads de SQL Injection.

**Uso básico:**

```bash
python sql-injection.py --target all --delay 0.5
```

**Opções:**

- `--target`: Alvo do teste (`login`, `params`, `advanced`, `all`)
- `--delay`: Delay entre requisições (padrão: `0.5`)

**Exemplos:**

```bash
# Teste apenas no endpoint de login
python sql-injection.py --target login

# Teste em query parameters
python sql-injection.py --target params

# Teste com técnicas avançadas de evasão
python sql-injection.py --target advanced

# Teste completo (todos os alvos)
python sql-injection.py --target all --delay 0.3
```

**Payloads testados:**

**Union-based:**

- `' UNION SELECT NULL--`
- `' UNION SELECT username, password FROM users--`

**Boolean-based:**

- `' OR '1'='1`
- `' OR 1=1--`
- `admin' --`

**Time-based:**

- `'; WAITFOR DELAY '00:00:05'--`
- `'; SELECT SLEEP(5)--`

**Error-based:**

- `' AND 1=CONVERT(int, @@version)--`

**Evasão:**

- Case manipulation: `' Or '1'='1`
- URL encoding: `%27%20OR%20%271%27%3D%271`
- Comments: `' OR/**/1=1--`

**Resultado esperado:**

```
🔴 Testando SQL Injection - Login Endpoint
   Payloads: 20

[1/20] Payload: ' UNION SELECT NULL--
              Email field:    403
              Password field: 403
              ⚠️  WAF BLOQUEOU!

[2/20] Payload: ' OR '1'='1
              Email field:    403
              Password field: 403
              ⚠️  WAF BLOQUEOU!

...

==========================================================
RELATÓRIO - SQL Injection (Login)
==========================================================
Total de payloads testados: 40
Bloqueados pelo WAF: 38
Bypasses (VULNERÁVEL): 0
Taxa de bloqueio: 95.0%
==========================================================
```

---

## 📊 Interpretando os Resultados

### Códigos de Resposta HTTP

- **200 OK:** Requisição aceita (possível vulnerabilidade!)
- **401 Unauthorized:** Credenciais inválidas (comportamento normal)
- **403 Forbidden:** WAF bloqueou a requisição (defesa funcionando!)
- **429 Too Many Requests:** Rate limit atingido
- **500 Internal Server Error:** Possível erro no servidor

### Métricas Importantes

**Taxa de Bloqueio:**

```
Taxa de Bloqueio = (Bloqueados / Total de Tentativas) × 100
```

- **> 90%:** Excelente proteção
- **70-90%:** Boa proteção, mas pode melhorar
- **< 70%:** Proteção insuficiente, vulnerável

**Threshold de Auto-Block:**

- Sistema deve bloquear IP após ~5-10 tentativas
- Se bloqueia muito cedo: falsos positivos
- Se bloqueia muito tarde: janela de ataque muito grande

---

## 🎯 Cenários de Teste Recomendados

### Cenário 1: Teste Básico de Defesas

```bash
# 1. Execute SQL Injection
python sql-injection.py --target login

# 2. Execute Brute Force
python brute-force.py

# 3. Verifique o dashboard
# (ver DOCUMENTATION.md para como acessar)
```

### Cenário 2: Teste de Rate Limiting

```bash
# Envie muitas requisições rapidamente
python brute-force.py --test-rate-limit

# Sistema deve começar a bloquear após threshold
```

### Cenário 3: Teste de Persistência de Bloqueio

```bash
# 1. Execute até ser bloqueado
python brute-force.py --delay 0.05

# 2. Tente novamente imediatamente
python brute-force.py --delay 0.05

# Deve ser bloqueado na primeira tentativa (IP na blocklist)
```

### Cenário 4: Teste de Evasão

```bash
# Teste técnicas avançadas
python sql-injection.py --target advanced

# Verifique quantos bypasses conseguiu
```

---

## 📈 Análise de Threat Intelligence

Após executar os ataques, analise no dashboard:

```bash
# 1. Login como admin
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}' \
  | jq -r '.access_token')

# 2. Veja eventos de segurança
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/monitoring/dashboard | jq '.recentEvents'

# 3. Veja threat actors (IPs maliciosos)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/monitoring/dashboard | jq '.topThreats'
```

**O que observar:**

1. **Threat Score:** Deve aumentar com cada ataque
2. **Attack Types:** Tipos de ataque detectados
3. **Risk Level:** LOW → MEDIUM → HIGH → CRITICAL
4. **Auto-block:** IPs com score >= 100 são bloqueados

---

## 🔧 Customizando os Scripts

### Adicionar Novos Payloads

Edite `sql-injection.py`:

```python
SQL_INJECTION_PAYLOADS = [
    # ... payloads existentes ...

    # Seus payloads customizados
    "' AND 1=2 UNION SELECT version()--",
    "admin'/**/OR/**/'1'='1",
]
```

### Modificar Wordlist de Brute Force

Edite `brute-force.py`:

```python
COMMON_PASSWORDS = [
    # ... senhas existentes ...

    # Adicione suas senhas
    "minha_senha_custom",
    "teste123",
]
```

### Criar Novo Script de Ataque

Exemplo de script para testar XSS:

```python
import requests

BASE_URL = "http://localhost:3000"

XSS_PAYLOADS = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
]

for payload in XSS_PAYLOADS:
    response = requests.post(
        f"{BASE_URL}/users",
        json={"name": payload, "email": "test@test.com", "password": "Test@123"},
    )
    print(f"Payload: {payload} | Status: {response.status_code}")
```

---

## ⚠️ Avisos Importantes

### 🚫 NÃO FAÇA

- ❌ Usar contra sistemas sem autorização
- ❌ Usar em produção sem supervisão
- ❌ Modificar para ataques reais maliciosos
- ❌ Distribuir para uso não-autorizado

### ✅ FAÇA

- ✅ Usar apenas em ambiente de desenvolvimento/teste
- ✅ Obter autorização antes de testar qualquer sistema
- ✅ Documentar resultados para análise
- ✅ Compartilhar descobertas com a equipe responsável
- ✅ Respeitar leis e regulamentos de cibersegurança

---

## 📚 Próximos Passos

Após rodar os scripts:

1. **Analise os logs** da aplicação
2. **Verifique o dashboard** de monitoramento
3. **Ajuste as regras** de detecção se necessário
4. **Documente** falsos positivos/negativos
5. **Melhore** os algoritmos de detecção

---

## 🆘 Troubleshooting

### Erro: "Connection refused"

A API não está rodando. Inicie com:

```bash
cd ..
pnpm run start:dev
```

### Erro: "ModuleNotFoundError: No module named 'requests'"

Instale a biblioteca:

```bash
pip install requests
```

### Script muito lento

Reduza o delay:

```bash
python brute-force.py --delay 0.01
```

### Não está detectando ataques

Verifique:

1. WAF está ativo? (ver logs da aplicação)
2. Patterns estão corretos? (ver `detection.service.ts`)
3. Database está conectado? (ver logs do PostgreSQL)

---

## 📖 Recursos Adicionais

- **OWASP Testing Guide:** https://owasp.org/www-project-web-security-testing-guide/
- **PayloadsAllTheThings:** https://github.com/swisskyrepo/PayloadsAllTheThings
- **SQL Injection Cheat Sheet:** https://portswigger.net/web-security/sql-injection/cheat-sheet

---

**Lembre-se: Com grandes poderes vêm grandes responsabilidades. Use estes scripts apenas para fins educacionais e com autorização apropriada! 🛡️**

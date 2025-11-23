# 🔐 Demonstração JWT - Roteiro para Apresentação

## 📋 Resumo

Este documento descreve como demonstrar a autenticação JWT implementada no projeto durante a apresentação acadêmica.

---

## 🎯 Objetivo da Demonstração

Mostrar de forma prática e visual como o **JSON Web Token (JWT)** protege endpoints sensíveis, exigindo autenticação válida para acesso ao dashboard SOC.

---

## 🚀 Fluxo de Demonstração

### **1️⃣ Preparação Inicial**

Antes de iniciar a apresentação:

```powershell
# Terminal 1 - Backend
cd "e:\Workspaces VScode\cybersec\NestJS-Attack-and-Defense-Lab"
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

✅ **Verificar:**

- Backend rodando em `http://localhost:3000`
- Frontend rodando em `http://localhost:5173`

---

### **2️⃣ Demonstração: Acesso Negado (401 Unauthorized)**

**Explicar para audiência:**

> "Vamos tentar acessar o dashboard de segurança **sem autenticação**. O sistema deve bloquear o acesso."

**Passos:**

1. Abrir navegador em **modo anônimo/privado** (Ctrl + Shift + N no Chrome)
2. Navegar para `http://localhost:5173`
3. **Resultado esperado:** Tela de login aparece automaticamente

**Demonstração alternativa via Terminal (opcional):**

```powershell
# Tentar acessar dashboard sem token
curl http://localhost:3000/monitoring/dashboard

# Resposta esperada:
# {"statusCode":401,"message":"Unauthorized"}
```

**Ponto-chave para enfatizar:**

> ✅ "Sem um token JWT válido, o acesso é **negado com HTTP 401**. O endpoint está protegido pelo `@UseGuards(JwtAuthGuard)`."

---

### **3️⃣ Demonstração: Login e Obtenção do Token**

**Explicar para audiência:**

> "Agora vamos fazer login com as credenciais do administrador para obter um token JWT válido."

**Passos:**

1. Na tela de login, inserir credenciais:
   - **Email:** `admin@example.com`
   - **Senha:** `admin123`

2. Clicar em **"Entrar"**

3. **Resultado esperado:** Dashboard carrega com dados em tempo real

**Demonstração via Terminal (opcional - mostrar o token):**

```powershell
# Fazer login via API
curl -X POST http://localhost:3000/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}'

# Resposta (exemplo):
# {
#   "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": 1,
#     "email": "admin@example.com",
#     "name": "Administrador",
#     "role": "admin"
#   }
# }
```

**Ponto-chave para enfatizar:**

> ✅ "O backend validou as credenciais e retornou um **token JWT assinado com RSA-256**. Este token é armazenado no `localStorage` do navegador."

---

### **4️⃣ Demonstração: Acesso Autorizado com Token**

**Explicar para audiência:**

> "Com o token JWT, todas as requisições ao dashboard são autenticadas automaticamente."

**Passos:**

1. Abrir **DevTools** (F12)
2. Ir para **Network** > **Fetch/XHR**
3. Observar requisições para `/monitoring/dashboard`
4. Clicar em uma requisição e mostrar **Headers**

**Headers esperados:**

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ponto-chave para enfatizar:**

> ✅ "O **interceptor Axios** adiciona automaticamente o header `Authorization: Bearer <token>` em todas as requisições. O backend valida a assinatura RSA antes de processar."

---

### **5️⃣ Demonstração: Informações do Usuário Autenticado**

**Explicar para audiência:**

> "O token JWT contém informações do usuário (payload), que podem ser extraídas e exibidas."

**Passos:**

1. No dashboard, observar **header superior** mostrando:
   - Nome do usuário: "Administrador"
   - Role: "admin"
   - Botão de logout

2. **Demonstração via Terminal (opcional):**

```powershell
# Obter informações do usuário autenticado
$token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."  # Token obtido no login

curl http://localhost:3000/auth/me `
  -H "Authorization: Bearer $token"

# Resposta esperada:
# {
#   "id": 1,
#   "email": "admin@example.com",
#   "name": "Administrador",
#   "role": "admin"
# }
```

**Ponto-chave para enfatizar:**

> ✅ "O endpoint `/auth/me` extrai os dados do payload do token e retorna informações do usuário **sem consultar o banco de dados** (stateless authentication)."

---

### **6️⃣ Demonstração: Controle de Acesso por Role - 403 Forbidden**

**Explicar para audiência:**

> "Agora vamos demonstrar a diferença entre **autenticação** (401) e **autorização** (403). Vou fazer login com um usuário comum que não tem permissão para acessar o SOC."

**Passos:**

1. Fazer logout (se estiver logado como admin)
2. Fazer login com usuário comum:
   - **Email:** `user@example.com`
   - **Senha:** `user123`
   - **Role:** `user`

3. **Resultado esperado:** Tela de erro **403 Forbidden** aparece com mensagem:

   ```
   🚫 Acesso Negado
   Seu usuário não tem permissão para acessar o SOC Dashboard.

   Acesso restrito a:
   👤 ADMIN | 🔍 ANALYST

   Você está logado como: Usuário Comum (Role: USER)
   ```

4. No **DevTools Network**, mostrar:
   - Request para `/monitoring/dashboard` com header `Authorization: Bearer <token>`
   - Response: **HTTP 403 Forbidden**

**Demonstração via Terminal (opcional):**

```powershell
# Login como usuário comum
curl -X POST http://localhost:3000/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"user@example.com\",\"password\":\"user123\"}'

# Copiar token retornado e tentar acessar dashboard
curl http://localhost:3000/monitoring/dashboard `
  -H "Authorization: Bearer <token_user_comum>"

# Resposta esperada:
# {"statusCode":403,"message":"Forbidden resource","error":"Forbidden"}
```

**💡 Ponto-chave para enfatizar:**

> ✅ "O usuário **está autenticado** (token JWT válido), mas **não está autorizado** a acessar este endpoint. O `@Roles(UserRole.ADMIN, UserRole.ANALYST)` garante que apenas usuários com roles específicas podem acessar o SOC Dashboard. Isso demonstra a diferença entre:
>
> - **401 Unauthorized** → Sem autenticação (sem token ou token inválido)
> - **403 Forbidden** → Autenticado, mas sem permissão (role insuficiente)"

---

### **7️⃣ Demonstração: Logout e Invalidação**

**Explicar para audiência:**

> "Ao fazer logout, o token é removido e o acesso é novamente negado."

**Passos:**

1. Clicar no botão **"Sair"** no header
2. **Resultado esperado:** Retorna para tela de login
3. Tentar acessar diretamente `http://localhost:5173`
4. **Resultado esperado:** Tela de login aparece (sem token no localStorage)

**Ponto-chave para enfatizar:**

> ✅ "O token foi removido do `localStorage`. Como o JWT é stateless, não há sessão no servidor - o cliente precisa armazenar e apresentar o token em cada requisição."

---

### **8️⃣ Demonstração: Token Expirado (Opcional - Avançado)**

**Se houver tempo, demonstrar expiração:**

1. Aguardar 1 hora (ou reduzir `expiresIn` no código para 1 minuto)
2. Dashboard automaticamente redireciona para login
3. Mensagem de erro: "Token expirado"

**Código para demonstrar (opcional):**

```typescript
// src/auth/auth.service.ts
return {
  access_token: this.jwtService.sign(payload, { expiresIn: '1m' }), // 1 minuto para demo
};
```

---

## 🎓 Conceitos Técnicos para Mencionar

Durante a demonstração, enfatizar:

### **1. Tecnologias Utilizadas**

- ✅ **JWT (JSON Web Token)** - RFC 7519
- ✅ **RSA-256** - Assinatura assimétrica com chaves pública/privada
- ✅ **Passport.js** - Estratégia de autenticação
- ✅ **Guards do NestJS** - `JwtAuthGuard` protege rotas

### **2. Fluxo de Autenticação**

```
1. Cliente envia credenciais (email + senha)
   ↓
2. Backend valida com bcrypt (hash comparison)
   ↓
3. Backend gera JWT assinado com chave privada RSA
   ↓
4. Cliente armazena token no localStorage
   ↓
5. Cliente inclui token em todas requisições (Authorization header)
   ↓
6. Backend valida assinatura com chave pública RSA
   ↓
7. Backend extrai payload e autoriza acesso
```

### **3. Segurança**

- ✅ **Stateless** - Sem sessões no servidor (escalável)
- ✅ **Assinatura RSA** - Impossível forjar tokens sem chave privada
- ✅ **Payload criptografado** - Base64URL encoding (não plain text)
- ✅ **Expiração automática** - Tokens têm TTL (Time To Live)
- ✅ **HTTPS em produção** - Protege token em trânsito (não implementado em dev)

### **4. Endpoints Protegidos**

```typescript
// ❌ Sem autenticação (honeypots, login)
/admin
/phpmyadmin
/.env
/auth/login

// ✅ Com autenticação JWT obrigatória
/monitoring/dashboard
/monitoring/status
/users (POST - criar usuário - requer role ADMIN)
```

---

## 📊 Comparação: Antes vs Depois

| **Aspecto**          | **Antes (sem JWT)**       | **Depois (com JWT)**            |
| -------------------- | ------------------------- | ------------------------------- |
| Acesso ao dashboard  | Público (qualquer pessoa) | Protegido (apenas autenticados) |
| Segurança            | ❌ Baixa                  | ✅ Alta                         |
| Escalabilidade       | ❌ Sessões no servidor    | ✅ Stateless (sem sessões)      |
| Demonstrabilidade    | ❌ Código morto           | ✅ Fluxo funcional completo     |
| Relevância acadêmica | ❌ JWT não usado          | ✅ JWT core do projeto          |

---

## 🎬 Roteiro de Falas (Sugestão)

**Slide 1 - Introdução:**

> "Nosso projeto implementa autenticação JWT para proteger endpoints sensíveis. Vamos demonstrar na prática como funciona."

**Slide 2 - Tentativa sem autenticação:**

> "Primeiro, tentamos acessar o dashboard sem fazer login. Observe que recebemos **HTTP 401 Unauthorized** - o acesso é bloqueado."

**Slide 3 - Login:**

> "Agora fazemos login com credenciais válidas. O backend verifica o hash bcrypt da senha e retorna um **token JWT assinado com RSA-256**."

**Slide 4 - Acesso autorizado:**

> "Com o token, o frontend adiciona automaticamente o header `Authorization: Bearer <token>` em todas requisições. O backend valida a assinatura e libera o acesso."

**Slide 5 - Payload do token:**

> "O JWT contém informações do usuário (email, role, etc.) no payload. Isso permite autenticação **stateless** - sem consultar banco de dados a cada requisição."

**Slide 6 - Logout:**

> "Ao fazer logout, o token é removido e o acesso é novamente negado. Como não há sessão no servidor, basta deletar o token do cliente."

**Slide 7 - Conclusão:**

> "Implementamos autenticação JWT completa com chaves RSA, seguindo as melhores práticas de segurança. O sistema é **stateless, escalável e seguro**."

---

## ✅ Checklist Pré-Apresentação

- [ ] Backend rodando (`npm run start:dev`)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Banco de dados com usuário admin criado (`npm run bootstrap`)
- [ ] Navegador em modo anônimo (limpo, sem tokens anteriores)
- [ ] DevTools aberto na aba Network
- [ ] Terminal preparado para demonstrações curl (opcional)
- [ ] Slides prontos com este roteiro
- [ ] Tempo estimado: **5-7 minutos** para demonstração completa

---

## 🐛 Troubleshooting

**Problema:** Dashboard não carrega após login

- **Solução:** Verificar console do navegador (F12) - erro de CORS ou backend offline

**Problema:** Login retorna 401 mesmo com credenciais corretas

- **Solução:** Rodar `npm run bootstrap` para criar usuário admin

**Problema:** Token não é enviado nas requisições

- **Solução:** Verificar `localStorage.getItem('access_token')` no console - deve conter o token

**Problema:** Backend retorna "invalid signature"

- **Solução:** Regenerar chaves RSA:

```powershell
cd keys
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

---

## 📚 Referências Técnicas

- **JWT Specification:** https://datatracker.ietf.org/doc/html/rfc7519
- **NestJS Authentication:** https://docs.nestjs.com/security/authentication
- **Passport JWT Strategy:** http://www.passportjs.org/packages/passport-jwt/
- **RSA Cryptography:** https://en.wikipedia.org/wiki/RSA_(cryptosystem)

---

**🎓 Boa sorte na apresentação!**

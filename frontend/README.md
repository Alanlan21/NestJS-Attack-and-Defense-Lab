# 🎯 SOC Dashboard Frontend

Dashboard web em tempo real para visualização de eventos de segurança do **NestJS Attack & Defense Lab**.

## 🚀 Quick Start

```bash
# 1. Instalar dependências
cd frontend
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Acessar dashboard
# http://localhost:5173
# Login: admin@example.com / Admin@123456
```

## ✨ Funcionalidades

### 📊 Métricas em Tempo Real

- **Total de Eventos** - Contador de todos os eventos de segurança
- **Ataques Bloqueados** - Percentual de requisições maliciosas bloqueadas
- **Ameaças Ativas** - IPs com threat score elevado
- **Tipos de Ataque** - Vetores de ataque detectados

### 📈 Visualizações

- **Timeline de Ataques** - Gráfico de 60 minutos com intervalos de 5 min
- **Distribuição por Tipo** - Barras de progresso por tipo de ataque
- **Top Threat Actors** - Tabela com IPs mais perigosos e seus scores
- **Live Events Feed** - Stream em tempo real dos últimos 10 eventos
- **Attack Details Modal** - Modal com payload completo e metadados
- **Reset Demo** - Botão para limpar todos os dados (ADMIN only)

### ⚡ Auto-Refresh

- Atualização automática a cada **5 segundos**
- Botão para ativar/desativar auto-refresh
- Refresh manual disponível

## 🛠️ Stack Técnica

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Auth:** JWT (RS256) com RBAC

## 📋 Pré-requisitos

1. **Backend rodando** em `http://localhost:3000`
2. **Node.js 18+** e **npm** instalados

## 🎬 Como Usar na Apresentação

### 1. Preparação

```bash
# Terminal 1 - Backend
pnpm start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Ataques
cd scripts/attacks
```

### 2. Demonstração

1. **Abrir dashboard** (`http://localhost:5173`)
2. **Fazer login** (admin@example.com / Admin@123456)
3. **Executar ataque:**
   ```bash
   python sql-injection.py
   ```
4. **Observar:**
   - Cards de métricas atualizam
   - Gráfico de timeline cresce
   - Eventos aparecem no feed em tempo real
   - Threat score aumenta visualmente
   - IP fica "BLOCKED" quando score >= 100

### 3. Pontos para Destacar

- ✅ **JWT em ação:** Ver token no DevTools (Network → Headers)
- ✅ **Auto-refresh:** Atualização sem reload da página
- ✅ **Severidade visual:** CRITICAL vermelho, HIGH laranja, etc.
- ✅ **Attack Details:** Clicar em evento para ver payload completo
- ✅ **Reset Demo:** Limpar dados e recomeçar apresentação

## 🐛 Troubleshooting

### Dashboard não carrega dados

**Solução:**

1. Verificar se backend está rodando
2. Verificar CORS em `src/main.ts`
3. Checar console do browser (F12)

### CORS Error

Backend deve ter CORS habilitado em `src/main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:5173'],
  credentials: true,
});
```

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
```

## ✨ Funcionalidades

### 📊 Métricas em Tempo Real

- **Total de Eventos** - Contador de todos os eventos de segurança
- **Ataques Bloqueados** - Percentual de requisições maliciosas bloqueadas
- **Ameaças Ativas** - IPs com threat score elevado
- **Tipos de Ataque** - Vetores de ataque detectados

### 📈 Visualizações

- **Timeline de Ataques** - Gráfico de linha mostrando ataques nas últimas 24h
- **Distribuição por Tipo** - Barras de progresso por tipo de ataque
- **Top Threat Actors** - Tabela com IPs mais perigosos e seus scores
- **Live Events Feed** - Stream em tempo real de eventos de segurança

### ⚡ Auto-Refresh

- Atualização automática a cada **5 segundos**
- Botão para ativar/desativar auto-refresh
- Refresh manual disponível

## 🛠️ Stack Técnica

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (tema cybersecurity custom)
- **Charts:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios

## 📋 Pré-requisitos

1. **Backend rodando** em `http://localhost:3000`

   ```bash
   # No diretório raiz do projeto
   pnpm start:dev
   ```

2. **Node.js 18+** e **npm** instalados

## 🎨 Layout

### Cores do Tema Cyber

- **Background:** Gradiente escuro (#0a0e27 → #050814)
- **Primary:** Cyan (#00d4ff)
- **Secondary:** Purple (#7b68ee)
- **Danger:** Red (#ff2e63)
- **Success:** Green (#00ff88)

### Componentes

#### MetricCard

Card de métrica com ícone, valor e trend indicator.

#### AttackChart

Gráfico de área/linha para timeline de ataques.

#### ThreatTable

Tabela com IPs, threat scores, risk levels e status.

#### LiveEvents

Feed ao vivo de eventos com severidade colorida.

## 🔧 Configuração

### Variáveis de Ambiente (opcional)

Crie `.env` no diretório `frontend/`:

```env
VITE_API_URL=http://localhost:3000
```

### Proxy (configurado no vite.config.js)

O Vite está configurado para fazer proxy de `/api` para `http://localhost:3000`, evitando problemas de CORS em desenvolvimento.

## 📦 Build para Produção

```bash
# Compilar
npm run build

# Preview da build
npm run preview
```

Os arquivos compilados estarão em `frontend/dist/`.

## 🎬 Como Usar na Apresentação

### 1. Preparação

```bash
# Terminal 1 - Backend
cd /path/to/project
pnpm start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Ataques
cd /path/to/project
```

### 2. Demonstração

1. **Abrir dashboard** no projetor (`http://localhost:5173`)
2. **Mostrar estado inicial** (poucos eventos)
3. **Executar ataque:**
   ```bash
   python scripts/attacks/sql-injection.py --target login
   ```
4. **Dashboard explode:**
   - Cards de métricas sobem
   - Gráfico de timeline cresce
   - Eventos aparecem no feed em tempo real
   - Threat score do IP aumenta visualmente
   - IP fica "BLOCKED" quando score >= 100

### 3. Pontos para Destacar

- ✅ **Auto-refresh:** Atualização sem reload da página
- ✅ **Severidade visual:** CRITICAL vermelho, HIGH laranja, etc.
- ✅ **Threat scoring dinâmico:** Barra de progresso mostra score em tempo real
- ✅ **Status monitoring:** IP passa de MONITORING → BLOCKED ao vivo

## 🐛 Troubleshooting

### Dashboard não carrega dados

**Problema:** "Erro ao conectar com o backend"

**Solução:**

1. Verificar se backend está rodando: `curl http://localhost:3000/monitoring/dashboard`
2. Verificar CORS no `src/main.ts` (deve incluir `http://localhost:5173`)
3. Verificar console do browser (F12) para erros de rede

### CORS Error

**Problema:** "Access to XMLHttpRequest blocked by CORS policy"

**Solução:**
Backend deve ter CORS habilitado em `src/main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:5173'],
  credentials: true,
});
```

### Gráficos não aparecem

**Problema:** Componentes de gráfico não renderizam

**Solução:**

1. Verificar se `timeline` tem dados no response da API
2. Verificar formato esperado: `[{ hour: "09:00", count: 12 }, ...]`
3. Checar console para erros do Recharts

## 📖 API Endpoints Utilizados

### GET `/monitoring/dashboard`

Retorna métricas completas do SOC:

```json
{
  "totalEvents": 234,
  "blockedEvents": 189,
  "attacksByType": {
    "SQL_INJECTION": 120,
    "BRUTE_FORCE": 45
  },
  "topThreats": [
    {
      "ip": "192.168.1.100",
      "threatScore": 250,
      "riskLevel": "CRITICAL",
      "attackCount": 45
    }
  ],
  "recentEvents": [...],
  "timeline": [
    { "hour": "09:00", "count": 12 }
  ]
}
```

### GET `/monitoring/status`

Status do sistema de segurança (não usado atualmente, reservado para futuro).

## 🚀 Próximos Passos

Ideias para expansão:

- [ ] WebSocket para updates em tempo real (substituir polling)
- [ ] Filtros por tipo de ataque / severidade
- [ ] Busca de eventos por IP
- [ ] Exportar relatórios em PDF
- [ ] Dark/Light mode toggle
- [ ] Gráficos adicionais (pizza, barras)
- [ ] Autenticação JWT
- [ ] Notificações desktop (Notification API)

## 📄 Licença

Projeto educacional desenvolvido para demonstração do CyBOK.

---

**Desenvolvido com ⚡ Vite + React + Tailwind**

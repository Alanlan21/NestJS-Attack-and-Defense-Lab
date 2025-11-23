import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Ban,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import MetricCard from './components/MetricCard';
import AttackChart from './components/AttackChart';
import ThreatTable from './components/ThreatTable';
import LiveEvents from './components/LiveEvents';
import AttackDetailsModal from './components/AttackDetailsModal';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import ForbiddenPage from './pages/ForbiddenPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { securityAPI } from './services/api';

function DashboardContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchDashboard = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setError(null);
      setForbidden(false);
      const data = await securityAPI.getDashboard();

      setDashboardData(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      // Diferenciar erro 403 (sem permissão) de outros erros
      if (err.response?.status === 403) {
        setForbidden(true);
        setError(
          '🚫 Acesso Negado: Seu usuário não tem permissão para acessar o SOC Dashboard. Apenas usuários com role ADMIN ou ANALYST podem visualizar estas informações.',
        );
      } else {
        setError(
          'Erro ao conectar com o backend. Verifique se a API está rodando em http://localhost:3000',
        );
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    // Só inicia polling se estiver autenticado E não estiver com erro 403
    if (!isAuthenticated || forbidden) {
      setLoading(false);
      return;
    }

    // Buscar dados imediatamente
    fetchDashboard();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboard, 5000); // Auto-refresh a cada 5 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isAuthenticated, forbidden]);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchDashboard();
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        '⚠️ Isso irá limpar TODOS os dados do dashboard (eventos, threat actors e blocklist). Continuar?',
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await securityAPI.resetDashboard();
      // Aguarda um pouco e recarrega os dados
      setTimeout(() => {
        fetchDashboard();
      }, 500);
    } catch (err) {
      console.error('Erro ao resetar dashboard:', err);
      alert(
        'Erro ao resetar dashboard. Verifique se você tem permissão de ADMIN.',
      );
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield
            className="animate-pulse text-cyber-blue mx-auto mb-4"
            size={64}
          />
          <p className="text-gray-400 text-lg">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Mostrar tela de login se não autenticado
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Mostrar tela 403 se usuário não tem permissão
  if (forbidden) {
    return <ForbiddenPage />;
  }

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield
            className="animate-pulse text-cyber-blue mx-auto mb-4"
            size={64}
          />
          <p className="text-gray-400 text-lg">Carregando SOC Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Erro de Conexão</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleManualRefresh}
            className="px-6 py-2 bg-cyber-blue text-white rounded-lg hover:bg-cyber-blue/80 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const {
    totalEvents = 0,
    blockedEvents = 0,
    attacksByType = {},
    topThreats = [],
    recentEvents = [],
    timeline = [],
  } = dashboardData || {};

  const attackCount = Object.values(attacksByType).reduce(
    (sum, count) => sum + count,
    0,
  );
  const blockedPercentage =
    totalEvents > 0 ? Math.round((blockedEvents / totalEvents) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Header />

        <div className="container mx-auto px-6 py-8">
          {/* Dashboard Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Visão Geral de Segurança
                </h2>
                <p className="text-gray-400 text-sm">
                  Monitoramento em tempo real
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Última atualização</p>
                  <p className="text-sm text-gray-300">
                    {lastUpdate.toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={handleManualRefresh}
                  className="p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-colors shadow-lg"
                  title="Atualizar agora"
                >
                  <RefreshCw
                    className={`text-cyan-400 ${loading ? 'animate-spin' : ''}`}
                    size={20}
                  />
                </button>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-4 py-2 rounded-lg transition-colors shadow-lg ${
                    autoRefresh
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                      : 'bg-gray-800/80 border border-gray-700/50 text-gray-400'
                  }`}
                >
                  <Activity size={16} className="inline mr-2" />
                  Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors shadow-lg"
                  title="Resetar Dashboard (Modo Apresentação)"
                >
                  <Trash2 size={16} className="inline mr-2" />
                  Reset Demo
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm">
                ⚠️ {error}
              </div>
            )}
          </header>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total de Eventos"
              value={totalEvents}
              subtitle="Eventos de segurança detectados"
              icon={Activity}
              color="blue"
            />
            <MetricCard
              title="Ataques Bloqueados"
              value={blockedEvents}
              subtitle={`${blockedPercentage}% dos eventos`}
              icon={Ban}
              color="red"
            />
            <MetricCard
              title="Ameaças Ativas"
              value={topThreats.length}
              subtitle="IPs com threat score elevado"
              icon={AlertTriangle}
              color="yellow"
            />
            <MetricCard
              title="Tipos de Ataque"
              value={Object.keys(attacksByType).length}
              subtitle="Vetores detectados"
              icon={Shield}
              color="purple"
            />
          </div>

          {/* Attack Types Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
                Ataques por Tipo
              </h3>
              <div className="space-y-3">
                {Object.entries(attacksByType).map(([type, count]) => {
                  const percentage =
                    attackCount > 0 ? (count / attackCount) * 100 : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-sm">
                          {type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-white font-semibold text-sm">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(attacksByType).length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum ataque detectado ainda
                  </p>
                )}
              </div>
            </div>

            <AttackChart data={timeline} type="area" />
          </div>

          {/* Threat Actors Table */}
          <div className="mb-8">
            <ThreatTable threats={topThreats} />
          </div>

          {/* Live Events Feed */}
          <LiveEvents events={recentEvents} onEventClick={setSelectedEvent} />

          {/* Attack Details Modal */}
          <AttackDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />

          {/* Footer */}
          <footer className="mt-8 text-center text-gray-500 text-sm">
            <p>NestJS Attack & Defense Lab • CyBOK 2025</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

export default App;

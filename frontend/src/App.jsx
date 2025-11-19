import React, { useState, useEffect } from 'react';
import { Shield, Activity, AlertTriangle, Ban, RefreshCw } from 'lucide-react';
import MetricCard from './components/MetricCard';
import AttackChart from './components/AttackChart';
import ThreatTable from './components/ThreatTable';
import LiveEvents from './components/LiveEvents';
import { securityAPI } from './services/api';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const data = await securityAPI.getDashboard();
      setDashboardData(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError(
        'Erro ao conectar com o backend. Verifique se a API está rodando em http://localhost:3000',
      );
      setLoading(false);
      console.error('Dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboard, 5000); // Auto-refresh a cada 5 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchDashboard();
  };

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
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Shield className="text-cyber-blue mr-3" size={40} />
            <div>
              <h1 className="text-4xl font-bold text-white">SOC Dashboard</h1>
              <p className="text-gray-400">NestJS Attack & Defense Lab</p>
            </div>
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
              className="p-3 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg hover:bg-cyber-blue/20 transition-colors"
              title="Atualizar agora"
            >
              <RefreshCw
                className={`text-cyber-blue ${loading ? 'animate-spin' : ''}`}
                size={20}
              />
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                autoRefresh
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
              }`}
            >
              <Activity size={16} className="inline mr-2" />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
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
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">
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
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyber-blue to-cyber-purple h-2 rounded-full transition-all duration-500"
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
      <LiveEvents events={recentEvents} />

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>
          🛡️ NestJS Attack & Defense Lab • CyBOK 2025 • Desenvolvido para fins
          educacionais
        </p>
      </footer>
    </div>
  );
}

export default App;

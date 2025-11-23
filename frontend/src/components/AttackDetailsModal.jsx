import React from 'react';
import { X, Shield, Clock, MapPin, Activity, Code } from 'lucide-react';

const AttackDetailsModal = ({ event, onClose }) => {
  if (!event) return null;

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-green-400 bg-green-500/10 border-green-500/30',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      critical: 'text-red-400 bg-red-500/10 border-red-500/30',
    };
    return colors[severity?.toLowerCase()] || colors.low;
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-cyber-blue" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalhes do Ataque
              </h2>
              <p className="text-gray-400 text-sm">
                ID: {event.id?.substring(0, 8)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attack Type */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-cyber-blue" size={20} />
                <h3 className="text-gray-400 text-sm font-semibold">
                  Tipo de Ataque
                </h3>
              </div>
              <p className="text-white text-lg font-mono">
                {event.attackType?.replace(/_/g, ' ')}
              </p>
            </div>

            {/* Severity */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-cyber-purple" size={20} />
                <h3 className="text-gray-400 text-sm font-semibold">
                  Severidade
                </h3>
              </div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(event.threatLevel)}`}
              >
                {event.threatLevel?.toUpperCase()}
              </span>
            </div>

            {/* Source IP */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-red-400" size={20} />
                <h3 className="text-gray-400 text-sm font-semibold">
                  IP de Origem
                </h3>
              </div>
              <code className="text-cyber-blue text-lg font-mono">
                {event.sourceIp}
              </code>
            </div>

            {/* Timestamp */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-yellow-400" size={20} />
                <h3 className="text-gray-400 text-sm font-semibold">
                  Data/Hora
                </h3>
              </div>
              <p className="text-white text-sm">
                {formatDate(event.detectedAt || event.timestamp)}
              </p>
            </div>
          </div>

          {/* Endpoint & Method */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="text-green-400" size={20} />
              <h3 className="text-gray-400 text-sm font-semibold">
                Endpoint Alvo
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono font-bold">
                {event.method || 'POST'}
              </span>
              <code className="text-white font-mono">{event.endpoint}</code>
            </div>
          </div>

          {/* User Agent */}
          {event.userAgent && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                User Agent
              </h3>
              <p className="text-gray-300 text-sm font-mono break-all">
                {event.userAgent}
              </p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                Descrição
              </h3>
              <p className="text-gray-300 text-sm">{event.description}</p>
            </div>
          )}

          {/* Payload */}
          {event.payload && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                Payload
              </h3>
              <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs">
                <code className="text-green-400 font-mono">
                  {JSON.stringify(event.payload, null, 2)}
                </code>
              </pre>
            </div>
          )}

          {/* Metadata */}
          {event.metadata && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                Metadata
              </h3>
              <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs">
                <code className="text-yellow-400 font-mono">
                  {JSON.stringify(event.metadata, null, 2)}
                </code>
              </pre>
            </div>
          )}

          {/* Status */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-semibold mb-3">
              Status da Resposta
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${event.blocked ? 'bg-red-500' : 'bg-gray-500'}`}
                />
                <span className="text-sm text-gray-300">
                  {event.blocked ? 'Bloqueado' : 'Apenas Registrado'}
                </span>
              </div>
              {event.falsePositive && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-gray-300">Falso Positivo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyber-blue text-white rounded-lg hover:bg-cyber-blue/80 transition-colors font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttackDetailsModal;

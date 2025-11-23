import React from 'react';
import {
  Activity,
  AlertCircle,
  Shield,
  Bug,
  FileWarning,
  Zap,
} from 'lucide-react';

const LiveEvents = ({ events, onEventClick }) => {
  const getEventIcon = (type) => {
    const icons = {
      SQL_INJECTION: Bug,
      XSS: FileWarning,
      BRUTE_FORCE: Zap,
      PATH_TRAVERSAL: AlertCircle,
      SUSPICIOUS_PATTERN: Shield,
    };
    return icons[type] || Activity;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'border-l-green-500 bg-green-500/5',
      MEDIUM: 'border-l-yellow-500 bg-yellow-500/5',
      HIGH: 'border-l-orange-500 bg-orange-500/5',
      CRITICAL: 'border-l-red-500 bg-red-500/5',
    };
    return colors[severity] || colors.LOW;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Activity className="mr-2 text-cyber-blue animate-pulse" size={24} />
        Live Security Events
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events && events.length > 0 ? (
          events.slice(0, 20).map((event, index) => {
            const EventIcon = getEventIcon(event.attackType);
            return (
              <div
                key={index}
                onClick={() => onEventClick && onEventClick(event)}
                className={`border-l-4 ${getSeverityColor(event.severity)} p-4 rounded-r-lg hover:bg-white/5 transition-all duration-200 animate-fadeIn cursor-pointer hover:scale-[1.02] hover:shadow-lg`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <EventIcon className="text-cyber-blue mt-1" size={18} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-semibold text-sm">
                          {event.attackType?.replace(/_/g, ' ') || 'UNKNOWN'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            event.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400'
                              : event.severity === 'HIGH'
                                ? 'bg-orange-500/20 text-orange-400'
                                : event.severity === 'MEDIUM'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {event.severity}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-1">
                        IP:{' '}
                        <code className="text-cyber-blue font-mono">
                          {event.sourceIp}
                        </code>
                      </p>
                      <p className="text-gray-500 text-xs">
                        {event.path} • {event.method || 'POST'}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs whitespace-nowrap ml-4">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Activity size={48} className="mx-auto mb-4 opacity-20" />
            <p>Aguardando eventos de segurança...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveEvents;

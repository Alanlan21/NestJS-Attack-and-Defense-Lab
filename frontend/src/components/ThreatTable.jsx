import React from 'react';
import { Shield, AlertTriangle, Ban } from 'lucide-react';

const ThreatTable = ({ threats }) => {
  const getRiskLevelColor = (level) => {
    const colors = {
      LOW: 'text-green-400 bg-green-500/10 border-green-500/30',
      MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
    };
    return colors[level] || colors.LOW;
  };

  const getRiskIcon = (level) => {
    if (level === 'CRITICAL' || level === 'HIGH') return AlertTriangle;
    return Shield;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Shield className="mr-2 text-cyber-blue" size={24} />
        Top Threat Actors
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">
                IP Address
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">
                Threat Score
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">
                Risk Level
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">
                Attacks
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {threats && threats.length > 0 ? (
              threats.slice(0, 10).map((threat, index) => {
                const RiskIcon = getRiskIcon(threat.riskLevel);
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <code className="text-cyber-blue font-mono text-sm">
                        {threat.ip}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-red-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((threat.threatScore / 200) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-white font-semibold">
                          {threat.threatScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRiskLevelColor(threat.riskLevel)}`}
                      >
                        <RiskIcon size={12} className="mr-1" />
                        {threat.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {threat.attackCount || 0}
                    </td>
                    <td className="py-3 px-4">
                      {threat.threatScore >= 100 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400">
                          <Ban size={12} className="mr-1" />
                          BLOCKED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                          MONITORING
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  Nenhuma ameaça detectada ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThreatTable;

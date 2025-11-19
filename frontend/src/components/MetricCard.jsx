import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    red: 'text-red-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-200`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-lg bg-white/5 ${iconColorClasses[color]}`}
          >
            <Icon size={24} />
          </div>
        )}
      </div>

      {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}

      {trend !== undefined && (
        <div className="flex items-center mt-2 text-xs">
          {trend > 0 ? (
            <>
              <TrendingUp size={14} className="text-red-400 mr-1" />
              <span className="text-red-400">+{trend}%</span>
            </>
          ) : trend < 0 ? (
            <>
              <TrendingDown size={14} className="text-green-400 mr-1" />
              <span className="text-green-400">{trend}%</span>
            </>
          ) : (
            <span className="text-gray-400">Sem mudanças</span>
          )}
          <span className="text-gray-500 ml-1">vs última hora</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

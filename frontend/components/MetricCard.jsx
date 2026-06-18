import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, subtitle, change, changeType, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${color || 'bg-gray-100'}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className={`mt-4 flex items-center space-x-1 text-sm ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {changeType === 'positive' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-medium">{Math.abs(change)}%</span>
          <span className="text-gray-500">vs. período anterior</span>
        </div>
      )}
    </div>
  );
}
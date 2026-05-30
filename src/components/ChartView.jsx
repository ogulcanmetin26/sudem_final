import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend, LineChart, Line, Area, AreaChart 
} from 'recharts';
import { TrendingUp, Target, PieChart } from 'lucide-react';

const ChartView = ({ targets, rationStats, feeds, rations, animalType }) => {
  // Prepare data for comparison chart
  const comparisonData = useMemo(() => [
    {
      name: 'Enerji (ME)',
      hedef: parseFloat(targets.energy.toFixed(2)),
      mevcut: parseFloat(rationStats.totalEnergy.toFixed(2)),
      unit: 'MJ/kg'
    },
    {
      name: 'Ham Protein',
      hedef: parseFloat(targets.protein.toFixed(1)),
      mevcut: parseFloat(rationStats.totalProtein.toFixed(1)),
      unit: '%'
    }
  ], [targets, rationStats]);

  // Prepare data for fulfillment gauge
  const energyFulfillment = useMemo(() => {
    if (targets.energy <= 0) return 0;
    return Math.min((rationStats.totalEnergy / targets.energy) * 100, 120);
  }, [rationStats.totalEnergy, targets.energy]);

  const proteinFulfillment = useMemo(() => {
    if (targets.protein <= 0) return 0;
    return Math.min((rationStats.totalProtein / targets.protein) * 100, 120);
  }, [rationStats.totalProtein, targets.protein]);

  // Prepare category distribution for pie chart
  const categoryData = useMemo(() => {
    const categoryTotals = {};
    rations.forEach(ration => {
      const feed = feeds.find(f => f.id === ration.feedId);
      if (feed) {
        categoryTotals[feed.category] = (categoryTotals[feed.category] || 0) + ration.amount;
      }
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(1))
    }));
  }, [rations, feeds]);

  const getAnimalTitle = () => {
    switch (animalType) {
      case 'beef': return 'Besi Sığırı';
      case 'dairy': return 'Süt Sığırı';
      case 'poultry': return 'Kanatlılar';
      default: return 'Hayvan';
    }
  };

  const getProgressColor = (percent) => {
    if (percent >= 90 && percent <= 110) return '#10b981'; // emerald
    if (percent >= 80 && percent <= 120) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span> {entry.payload.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Besin Değerlendirme Grafiği</h3>
            <p className="text-slate-500 text-sm">
              {getAnimalTitle()} - Enerji ve Protein Karşılaştırması
            </p>
          </div>
        </div>
      </div>

      {/* Fulfillment Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Energy Fulfillment */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-amber-800">Enerji Gerçekleşme</span>
            <span className={`text-2xl font-bold`} style={{ color: getProgressColor(energyFulfillment) }}>
              {energyFulfillment.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${Math.min(energyFulfillment, 100)}%`,
                backgroundColor: getProgressColor(energyFulfillment)
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-amber-700">
            <span>{rationStats.totalEnergy.toFixed(2)} MJ/kg</span>
            <span>Hedef: {targets.energy} MJ/kg</span>
          </div>
        </div>

        {/* Protein Fulfillment */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-blue-800">Protein Gerçekleşme</span>
            <span className={`text-2xl font-bold`} style={{ color: getProgressColor(proteinFulfillment) }}>
              {proteinFulfillment.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${Math.min(proteinFulfillment, 100)}%`,
                backgroundColor: getProgressColor(proteinFulfillment)
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-blue-700">
            <span>{rationStats.totalProtein.toFixed(1)}%</span>
            <span>Hedef: {targets.protein}%</span>
          </div>
        </div>
      </div>

      {/* Comparison Bar Chart */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-violet-600" />
          <span className="text-sm font-semibold text-slate-700">Hedef vs Mevcut Değerler</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontWeight: 500 }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => <span className="text-slate-600 font-medium">{value}</span>}
              />
              <Bar dataKey="hedef" name="Hedef" fill="#10b981" radius={[4, 4, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#10b981" />
                ))}
              </Bar>
              <Bar dataKey="mevcut" name="Mevcut" fill="#6366f1" radius={[4, 4, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#6366f1" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution (if rations exist) */}
      {categoryData.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} className="text-teal-600" />
            <span className="text-sm font-semibold text-slate-700">Yem Kategorisi Dağılımı</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#14b8a6" 
                    fill="#14b8a6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Category List */}
            <div className="space-y-3">
              {categoryData.map((cat, index) => {
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
                const color = colors[index % colors.length];
                const totalItems = rations.reduce((sum, r) => sum + r.amount, 0);
                const percentage = totalItems > 0 ? (cat.value / totalItems * 100).toFixed(1) : 0;
                
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="flex-1 text-sm text-slate-700">{cat.name}</span>
                    <span className="text-sm font-mono text-slate-600">{cat.value} kg</span>
                    <span className="text-sm font-medium text-slate-500">({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-600">
              {energyFulfillment >= 90 && energyFulfillment <= 110 ? '✓' : '○'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Enerji Hedefi</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-600">
              {proteinFulfillment >= 90 && proteinFulfillment <= 110 ? '✓' : '○'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Protein Hedefi</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-slate-700">{ratios?.length || 0}</div>
            <div className="text-xs text-slate-500 mt-1">Yem Maddesi</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-slate-700">
              {rationStats.totalWeight.toFixed(1)} kg
            </div>
            <div className="text-xs text-slate-500 mt-1">Toplam Ağırlık</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartView;

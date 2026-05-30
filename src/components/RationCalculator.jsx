import { useState, useMemo } from 'react';
import { Plus, Trash2, Calculator, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const RationCalculator = ({ feeds, targets, rations, onRationsChange }) => {
  const [selectedFeedId, setSelectedFeedId] = useState('');
  const [feedAmount, setFeedAmount] = useState('');

  // Calculate current ration totals
  const rationStats = useMemo(() => {
    if (rations.length === 0) {
      return { totalEnergy: 0, totalProtein: 0, totalWeight: 0 };
    }

    let totalWeight = 0;
    let weightedEnergy = 0;
    let weightedProtein = 0;

    rations.forEach(ration => {
      const feed = feeds.find(f => f.id === ration.feedId);
      if (feed) {
        totalWeight += ration.amount;
        weightedEnergy += feed.metabolizableEnergy * ration.amount;
        weightedProtein += feed.crudeProtein * ration.amount;
      }
    });

    return {
      totalEnergy: totalWeight > 0 ? weightedEnergy / totalWeight : 0,
      totalProtein: totalWeight > 0 ? weightedProtein / totalWeight : 0,
      totalWeight
    };
  }, [rations, feeds]);

  // Calculate percentage fulfillment
  const energyPercent = useMemo(() => {
    if (targets.energy <= 0) return 0;
    return Math.min((rationStats.totalEnergy / targets.energy) * 100, 150);
  }, [rationStats.totalEnergy, targets.energy]);

  const proteinPercent = useMemo(() => {
    if (targets.protein <= 0) return 0;
    return Math.min((rationStats.totalProtein / targets.protein) * 100, 150);
  }, [rationStats.totalProtein, targets.protein]);

  const getStatusClass = (percent, isLowerBad = true) => {
    const diff = Math.abs(percent - 100);
    if (diff <= 10) return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    if (diff <= 25) return 'text-amber-600 bg-amber-100 border-amber-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getStatusIcon = (percent) => {
    const diff = Math.abs(percent - 100);
    if (diff <= 10) return <CheckCircle2 size={18} />;
    return <AlertCircle size={18} />;
  };

  const getProgressBarColor = (percent) => {
    const diff = Math.abs(percent - 100);
    if (diff <= 10) return 'from-emerald-400 to-emerald-600';
    if (diff <= 25) return 'from-amber-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };

  const handleAddFeed = () => {
    if (!selectedFeedId || !feedAmount || parseFloat(feedAmount) <= 0) return;

    const newRation = {
      id: Date.now(),
      feedId: parseInt(selectedFeedId),
      amount: parseFloat(feedAmount)
    };

    onRationsChange([...rations, newRation]);
    setSelectedFeedId('');
    setFeedAmount('');
  };

  const handleRemoveRation = (rationId) => {
    onRationsChange(rations.filter(r => r.id !== rationId));
  };

  const handleClearAll = () => {
    if (window.confirm('Tüm rasyonu temizlemek istediğinizden emin misiniz?')) {
      onRationsChange([]);
    }
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Calculator size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Rasyon Simülatörü</h3>
            <p className="text-slate-500 text-sm">
              Yem seçin ve miktarları belirleyin
            </p>
          </div>
        </div>
        {rations.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <Trash2 size={16} />
            Temizle
          </button>
        )}
      </div>

      {/* Feed Selector */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 mb-6 border border-teal-200">
        <div className="flex items-center gap-2 mb-4">
          <Plus size={18} className="text-teal-600" />
          <span className="text-sm font-semibold text-teal-800">Yem Maddesi Ekle</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <select
              value={selectedFeedId}
              onChange={(e) => setSelectedFeedId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-teal-200 rounded-xl text-slate-800 
                       focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all duration-200"
            >
              <option value="">Yem Maddesi Seçin...</option>
              {feeds.map(feed => (
                <option key={feed.id} value={feed.id}>
                  {feed.name} ({feed.category})
                </option>
              ))}
            </select>
          </div>
          <div className="relative w-full md:w-40">
            <input
              type="number"
              value={feedAmount}
              onChange={(e) => setFeedAmount(e.target.value)}
              placeholder="Miktar (kg)"
              step="0.1"
              min="0"
              className="w-full pl-4 pr-14 py-3 bg-white border border-teal-200 rounded-xl text-slate-800 
                       focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all duration-200"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-600 font-medium text-sm">
              kg
            </span>
          </div>
          <button
            onClick={handleAddFeed}
            disabled={!selectedFeedId || !feedAmount}
            className="btn-primary flex items-center justify-center gap-2 md:w-auto px-8"
          >
            <Plus size={18} />
            Ekle
          </button>
        </div>
      </div>

      {/* Current Ration Summary */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-600 mb-4">Mevcut Rasyon</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Energy Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Toplam Enerji (ME)</span>
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(energyPercent)}`}>
                {getStatusIcon(energyPercent)}
                {energyPercent.toFixed(0)}%
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              {rationStats.totalEnergy.toFixed(2)}
              <span className="text-lg font-medium text-slate-400 ml-2">MJ/kg</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Hedef: {targets.energy} MJ/kg</span>
                <span>{rationStats.totalEnergy.toFixed(2)} / {targets.energy}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(energyPercent)} transition-all duration-500`}
                  style={{ width: `${Math.min(energyPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Protein Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Ham Protein</span>
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(proteinPercent)}`}>
                {getStatusIcon(proteinPercent)}
                {proteinPercent.toFixed(0)}%
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              {rationStats.totalProtein.toFixed(1)}
              <span className="text-lg font-medium text-slate-400 ml-2">%</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Hedef: {targets.protein}%</span>
                <span>{rationStats.totalProtein.toFixed(1)} / {targets.protein}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(proteinPercent)} transition-all duration-500`}
                  style={{ width: `${Math.min(proteinPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Total Weight Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Toplam Ağırlık</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {rations.length} yem
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              {rationStats.totalWeight.toFixed(1)}
              <span className="text-lg font-medium text-slate-400 ml-2">kg</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <ArrowRight size={14} />
              <span>Rasyon bileşimi hazır</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ration Items Table */}
      {rations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Yem Maddesi</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Kategori</th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Miktar (kg)</th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">ME (MJ/kg)</th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">HP (%)</th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Temizle</th>
              </tr>
            </thead>
            <tbody>
              {rations.map(ration => {
                const feed = feeds.find(f => f.id === ration.feedId);
                if (!feed) return null;
                return (
                  <tr key={ration.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{feed.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${feed.category === 'Kaba Yem' ? 'bg-amber-100 text-amber-700' :
                          feed.category === 'Kesif Yem' ? 'bg-blue-100 text-blue-700' :
                          feed.category === 'Yağlı Yem' ? 'bg-yellow-100 text-yellow-700' :
                          feed.category === 'Hayvansal Yem' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                        {feed.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">{ration.amount.toFixed(1)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">{feed.metabolizableEnergy.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">{feed.crudeProtein.toFixed(1)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRemoveRation(ration.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <span className="text-5xl mb-4 block">🌿</span>
          <p className="text-slate-500 font-medium">Henüz rasyon eklenmedi</p>
          <p className="text-slate-400 text-sm mt-1">Yukarıdan yem maddesi seçerek başlayın</p>
        </div>
      )}
    </div>
  );
};

export default RationCalculator;

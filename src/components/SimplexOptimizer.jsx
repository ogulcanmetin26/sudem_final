import { useState, useMemo, useCallback } from 'react';
import { Calculator, Target, CheckCircle2, AlertCircle, Percent, Scale, RotateCcw, Check } from 'lucide-react';
import { calculateOptimalRation } from '../utils/simplex';

const SimplexOptimizer = ({ feeds, targets, onSelectFeed }) => {
  const [totalAmount, setTotalAmount] = useState(100);
  const [selectedFeedIndices, setSelectedFeedIndices] = useState([]);
  const [result, setResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Handle feed selection toggle
  const toggleFeedSelection = (index) => {
    setSelectedFeedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
    setResult(null);
  };

  // Select all feeds
  const selectAllFeeds = () => {
    setSelectedFeedIndices(feeds.map((_, i) => i));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedFeedIndices([]);
    setResult(null);
  };

  // Run optimization
  const runOptimization = useCallback(() => {
    if (selectedFeedIndices.length < 2) {
      alert('En az 2 yem maddesi seçilmelidir.');
      return;
    }

    if (totalAmount <= 0) {
      alert('Toplam rasyon miktarı 0\'dan büyük olmalıdır.');
      return;
    }

    setIsOptimizing(true);

    // Small delay for UX
    setTimeout(() => {
      const selectedFeeds = selectedFeedIndices.map(i => feeds[i]);
      const optResult = calculateOptimalRation(selectedFeeds, targets, totalAmount);
      setResult(optResult);
      setIsOptimizing(false);
    }, 500);
  }, [selectedFeedIndices, feeds, targets, totalAmount]);

  // Reset
  const handleReset = () => {
    setResult(null);
    setSelectedFeedIndices([]);
  };

  // Get status color and icon
  const getStatusStyle = (matchPercent) => {
    if (matchPercent <= 10) {
      return {
        bg: 'bg-emerald-100',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        icon: <CheckCircle2 size={18} />
      };
    }
    if (matchPercent <= 25) {
      return {
        bg: 'bg-amber-100',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: <AlertCircle size={18} />
      };
    }
    return {
      bg: 'bg-red-100',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: <AlertCircle size={18} />
    };
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Calculator size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Simplex Rasyon Optimizasyonu</h3>
          <p className="text-slate-500 text-sm">
            Maliyeti minimize eden optimal rasyonu hesapla
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Amount Input */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-emerald-800 mb-3">
            <Scale size={16} />
            Toplam Rasyon Miktarı
          </label>
          <div className="relative">
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => {
                setTotalAmount(parseFloat(e.target.value) || 0);
                setResult(null);
              }}
              min="1"
              step="1"
              className="w-full pl-4 pr-14 py-4 bg-white border-2 border-emerald-200 rounded-xl text-xl font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 font-semibold">
              kg
            </span>
          </div>
        </div>

        {/* Target Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-3">
            <Target size={16} />
            Hedef Besin Değerleri
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{targets.energy}</div>
              <div className="text-xs text-blue-500">ME (MJ/kg)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{targets.protein}</div>
              <div className="text-xs text-blue-500">Ham Protein (%)</div>
            </div>
          </div>
        </div>

        {/* Selection Actions */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Percent size={16} />
            Seçilen Yemler
          </label>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-slate-700">
              {selectedFeedIndices.length}
            </div>
            <div className="text-xs text-slate-500">adet yem seçildi</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAllFeeds}
              className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors"
            >
              Tümünü Seç
            </button>
            <button
              onClick={clearSelection}
              className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors"
            >
              Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Feed Selection Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-700">Kullanılacak Yem Maddelerini Seçin</h4>
          <button
            onClick={runOptimization}
            disabled={selectedFeedIndices.length < 2 || isOptimizing}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Calculator size={18} />
            {isOptimizing ? 'Hesaplanıyor...' : 'Optimizasyonu Çalıştır'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {feeds.map((feed, index) => {
            const isSelected = selectedFeedIndices.includes(index);
            return (
              <button
                key={feed.id}
                onClick={() => toggleFeedSelection(index)}
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left
                  ${isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <div className={`font-medium text-sm mb-1 pr-6 ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {feed.name}
                </div>
                <div className="text-xs text-slate-500">
                  {feed.costPerKg ? `${feed.costPerKg} TL/kg` : 'Maliyet yok'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  ME: {feed.metabolizableEnergy?.toFixed(2)} | HP: {feed.crudeProtein?.toFixed(1)}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calculator size={20} className="text-violet-600" />
            Optimizasyon Sonuçları
          </h4>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Cost */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
              <div className="text-xs text-emerald-100 mb-1">Toplam Maliyet</div>
              <div className="text-2xl font-bold">{result.totalCost?.toFixed(2) || 0} TL</div>
              <div className="text-xs text-emerald-100 mt-1">
                {totalAmount} kg rasyon
              </div>
            </div>

            {/* Cost per kg */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
              <div className="text-xs text-blue-100 mb-1">Kg Başına Maliyet</div>
              <div className="text-2xl font-bold">
                {(result.totalCost / totalAmount).toFixed(2)} TL
              </div>
              <div className="text-xs text-blue-100 mt-1">
                Ortalama maliyet
              </div>
            </div>

            {/* Energy Match */}
            <div className={`rounded-xl p-5 shadow-lg ${getStatusStyle(result.energyMatch).bg} ${getStatusStyle(result.energyMatch).border} border`}>
              <div className={`flex items-center gap-2 text-xs mb-1 ${getStatusStyle(result.energyMatch).text}`}>
                {getStatusStyle(result.energyMatch).icon}
                Enerji Gerçekleşme
              </div>
              <div className={`text-2xl font-bold ${getStatusStyle(result.energyMatch).text}`}>
                {Math.abs(100 - result.energyMatch) < 1 ? '100%' : `${(100 - result.energyMatch).toFixed(1)}%`}
              </div>
              <div className={`text-xs mt-1 ${getStatusStyle(result.energyMatch).text}`}>
                HK: {result.actualEnergy?.toFixed(2)} / {result.targetEnergy} MJ
              </div>
            </div>

            {/* Protein Match */}
            <div className={`rounded-xl p-5 shadow-lg ${getStatusStyle(result.proteinMatch).bg} ${getStatusStyle(result.proteinMatch).border} border`}>
              <div className={`flex items-center gap-2 text-xs mb-1 ${getStatusStyle(result.proteinMatch).text}`}>
                {getStatusStyle(result.proteinMatch).icon}
                Protein Gerçekleşme
              </div>
              <div className={`text-2xl font-bold ${getStatusStyle(result.proteinMatch).text}`}>
                {Math.abs(100 - result.proteinMatch) < 1 ? '100%' : `${(100 - result.proteinMatch).toFixed(1)}%`}
              </div>
              <div className={`text-xs mt-1 ${getStatusStyle(result.proteinMatch).text}`}>
                HP: {result.actualProtein?.toFixed(1)} / {result.targetProtein}%
              </div>
            </div>
          </div>

          {/* Ration Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Yem Adı</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Miktar (kg)</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Oran (%)</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Maliyet (TL)</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">ME (MJ)</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">HP (%)</th>
                </tr>
              </thead>
              <tbody>
                {result.ration?.filter(r => r.amount > 0.001).map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{item.feed.name}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {item.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {((item.amount / totalAmount) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {item.cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {(item.amount * item.feed.metabolizableEnergy).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {(item.amount * item.feed.crudeProtein / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                  <td className="py-3 px-4 text-slate-800">TOPLAM</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600">
                    {result.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">100%</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600">
                    {result.totalCost?.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {(result.actualEnergy * result.totalAmount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {(result.actualProtein * result.totalAmount / 100).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add to Ration Button */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <RotateCcw size={18} />
              Temizle
            </button>
            <button
              onClick={() => onSelectFeed?.(result.ration)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Check size={18} />
              Rasyona Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplexOptimizer;

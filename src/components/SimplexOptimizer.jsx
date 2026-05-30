import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  Calculator, Target, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, Search, Scale, X, Check,
  RotateCcw, DollarSign, Zap, Bean as ProteinIcon, Layers
} from 'lucide-react';
import { calculateOptimalRation } from '../utils/simplex';

const SimplexOptimizer = ({ feeds, targets, onSelectFeed }) => {
  const [totalAmount, setTotalAmount] = useState(100);
  const [selectedFeedIndices, setSelectedFeedIndices] = useState(new Set());
  const [result, setResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isFeedListCollapsed, setIsFeedListCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const resultsRef = useRef(null);
  
  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(feeds.map(f => f.category).filter(Boolean))];
    return ['all', ...cats];
  }, [feeds]);
  
  // Filter feeds based on search and category
  const filteredFeeds = useMemo(() => {
    return feeds.filter(feed => {
      const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || feed.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [feeds, searchTerm, categoryFilter]);
  
  // Toggle feed selection
  const toggleFeedSelection = (index) => {
    setSelectedFeedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
    setResult(null);
  };
  
  // Select all filtered feeds
  const selectAllFeeds = () => {
    setSelectedFeedIndices(new Set(filteredFeeds.map(f => feeds.indexOf(f))));
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedFeedIndices(new Set());
    setResult(null);
  };
  
  // Run optimization
  const runOptimization = useCallback(() => {
    if (selectedFeedIndices.size < 2) {
      alert('En az 2 yem maddesi seçilmelidir.');
      return;
    }
    if (totalAmount <= 0) {
      alert('Toplam rasyon miktarı 0\'dan büyük olmalıdır.');
      return;
    }
    
    setIsOptimizing(true);
    setIsFeedListCollapsed(true);
    
    setTimeout(() => {
      const selectedFeeds = [...selectedFeedIndices].map(i => feeds[i]);
      const optResult = calculateOptimalRation(selectedFeeds, targets, totalAmount);
      setResult(optResult);
      setIsOptimizing(false);
      
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 500);
  }, [selectedFeedIndices, feeds, targets, totalAmount]);
  
  // Reset
  const handleReset = () => {
    setResult(null);
    setSelectedFeedIndices(new Set());
    setIsFeedListCollapsed(false);
  };
  
  // Get status color based on match percentage
  const getStatusStyle = (matchPercent) => {
    if (matchPercent <= 10) {
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-700',
        bgLight: 'bg-emerald-50',
        border: 'border-emerald-200'
      };
    }
    if (matchPercent <= 25) {
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-700',
        bgLight: 'bg-amber-50',
        border: 'border-amber-200'
      };
    }
    return {
      bg: 'bg-red-500',
      text: 'text-red-700',
      bgLight: 'bg-red-50',
      border: 'border-red-200'
    };
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Calculator size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Simplex Rasyon Optimizasyonu</h3>
          <p className="text-slate-500 text-sm">Big-M Yöntemi ile optimal rasyon hesaplama</p>
        </div>
      </div>

      {/* Input Section - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Amount Input */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-emerald-800 mb-2">
            <Scale size={16} />
            Toplam Rasyon (kg)
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
              className="w-full pl-4 pr-12 py-3 bg-white border-2 border-emerald-200 rounded-xl text-lg font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 font-medium text-sm">
              kg
            </span>
          </div>
        </div>

        {/* Target Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-2">
            <Target size={16} />
            Hedef Değerler
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center bg-white/60 rounded-lg py-2">
              <div className="text-xl font-bold text-blue-700">{targets.energy}</div>
              <div className="text-xs text-blue-500">ME (MJ/kg)</div>
            </div>
            <div className="text-center bg-white/60 rounded-lg py-2">
              <div className="text-xl font-bold text-blue-700">{targets.protein}</div>
              <div className="text-xs text-blue-500">HP (%)</div>
            </div>
          </div>
        </div>

        {/* Selection Status */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Layers size={16} />
            Seçilen Yemler
          </label>
          <div className="text-center bg-white/60 rounded-lg py-2">
            <div className="text-2xl font-bold text-slate-700">{selectedFeedIndices.size}</div>
            <div className="text-xs text-slate-500">adet seçildi</div>
          </div>
        </div>
      </div>

      {/* RESULTS SECTION - TOP OF PAGE */}
      {result && (
        <div ref={resultsRef} className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Total Cost */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs text-emerald-100 mb-1">
                <DollarSign size={14} />
                Toplam Maliyet
              </div>
              <div className="text-xl font-bold">{result.totalCost?.toFixed(2) || 0} TL</div>
              <div className="text-xs text-emerald-100 mt-1">
                {(result.totalCost / totalAmount).toFixed(2)} TL/kg
              </div>
            </div>

            {/* Used Feeds */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs text-blue-100 mb-1">
                <Layers size={14} />
                Kullanılan Yem
              </div>
              <div className="text-xl font-bold">{result.ration?.length || 0}</div>
              <div className="text-xs text-blue-100 mt-1">adet yem</div>
            </div>

            {/* Energy Match */}
            <div className={`rounded-xl p-4 shadow-lg ${getStatusStyle(result.energyMatch).bgLight} ${getStatusStyle(result.energyMatch).border} border`}>
              <div className="flex items-center gap-2 text-xs mb-1">
                {result.energyMatch <= 10 ? <CheckCircle2 size={14} className="text-emerald-600" /> : 
                 result.energyMatch <= 25 ? <AlertCircle size={14} className="text-amber-600" /> : 
                 <AlertCircle size={14} className="text-red-600" />}
                <span className={`font-medium ${getStatusStyle(result.energyMatch).text}`}>Enerji</span>
              </div>
              <div className={`text-xl font-bold ${getStatusStyle(result.energyMatch).text}`}>
                {(100 - result.energyMatch).toFixed(0)}%
              </div>
              <div className="text-xs mt-1 text-slate-600">
                {result.actualEnergy?.toFixed(1)} / {result.targetEnergy} MJ
              </div>
            </div>

            {/* Protein Match */}
            <div className={`rounded-xl p-4 shadow-lg ${getStatusStyle(result.proteinMatch).bgLight} ${getStatusStyle(result.proteinMatch).border} border`}>
              <div className="flex items-center gap-2 text-xs mb-1">
                {result.proteinMatch <= 10 ? <CheckCircle2 size={14} className="text-emerald-600" /> : 
                 result.proteinMatch <= 25 ? <AlertCircle size={14} className="text-amber-600" /> : 
                 <AlertCircle size={14} className="text-red-600" />}
                <span className={`font-medium ${getStatusStyle(result.proteinMatch).text}`}>Protein</span>
              </div>
              <div className={`text-xl font-bold ${getStatusStyle(result.proteinMatch).text}`}>
                {(100 - result.proteinMatch).toFixed(0)}%
              </div>
              <div className="text-xs mt-1 text-slate-600">
                {result.actualProtein?.toFixed(1)} / {result.targetProtein}%
              </div>
            </div>

            {/* Deviation Info */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                <Zap size={14} />
                Sapma
              </div>
              <div className="text-xl font-bold text-slate-700">
                E: {result.energyMatch.toFixed(1)}%
              </div>
              <div className="text-xl font-bold text-slate-700">
                P: {result.proteinMatch.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Yem Adı</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Miktar (kg)</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Oran (%)</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Maliyet (TL)</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">ME (MJ/kg)</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">HP (%)</th>
                </tr>
              </thead>
              <tbody>
                {result.ration?.filter(r => r.amount > 0.001).map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-4 font-medium text-slate-800">{item.feed.name}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-600">{item.amount.toFixed(2)}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-600">
                      {((item.amount / totalAmount) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-slate-600">{item.cost.toFixed(2)}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-600">
                      {item.feed.metabolizableEnergy?.toFixed(1)}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-slate-600">
                      {item.feed.crudeProtein?.toFixed(1)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                  <td className="py-2 px-4 text-slate-800">TOPLAM</td>
                  <td className="py-2 px-4 text-right font-mono text-emerald-600">{result.totalAmount.toFixed(2)}</td>
                  <td className="py-2 px-4 text-right font-mono text-slate-600">100%</td>
                  <td className="py-2 px-4 text-right font-mono text-emerald-600">{result.totalCost?.toFixed(2)}</td>
                  <td className="py-2 px-4 text-right font-mono text-slate-600">{result.actualEnergy?.toFixed(1)}</td>
                  <td className="py-2 px-4 text-right font-mono text-slate-600">{result.actualProtein?.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Sıfırla
            </button>
            <button
              onClick={() => onSelectFeed?.(result.ration)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              <Check size={18} />
              Rasyona Ekle
            </button>
          </div>
        </div>
      )}

      {/* FEED SELECTION SECTION */}
      <div className="space-y-4">
        {/* Collapsible Header with Search */}
        <div 
          className="bg-slate-100 rounded-xl p-3 cursor-pointer hover:bg-slate-200 transition-colors"
          onClick={() => setIsFeedListCollapsed(!isFeedListCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProteinIcon size={18} className="text-slate-600" />
              <span className="font-semibold text-slate-700">
                Yem Seçimi {result ? '(Sonuç gösterildi - Tıkla açmak için)' : ''}
              </span>
              <span className="text-sm text-slate-500">
                ({filteredFeeds.length} yem listeleniyor)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runOptimization();
                }}
                disabled={selectedFeedIndices.size < 2 || isOptimizing}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Calculator size={16} />
                {isOptimizing ? 'Hesaplanıyor...' : 'Optimizasyonu Çalıştır'}
              </button>
              {isFeedListCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isFeedListCollapsed && (
          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Yem ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Tüm Kategoriler' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Selection Actions */}
            <div className="flex gap-3">
              <button
                onClick={selectAllFeeds}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
              >
                Tümünü Seç ({filteredFeeds.length})
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
              >
                Temizle
              </button>
            </div>

            {/* Feed Table - Compact with Max Height */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[288px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-100 sticky top-0 z-10">
                  <tr className="text-xs">
                    <th className="w-12 py-2 px-3 text-slate-600 font-semibold">Seç</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-semibold">İsim</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-semibold">Kategori</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-semibold">ME</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-semibold">HP%</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-semibold">Maliyet</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeeds.map((feed) => {
                    const idx = feeds.indexOf(feed);
                    const isSelected = selectedFeedIndices.has(idx);
                    return (
                      <tr 
                        key={feed.id} 
                        className={`border-t border-slate-100 cursor-pointer transition-colors
                          ${isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                        onClick={() => toggleFeedSelection(idx)}
                      >
                        <td className="py-2 px-3 text-center">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                        </td>
                        <td className="py-2 px-3 font-medium text-sm text-slate-800">{feed.name}</td>
                        <td className="py-2 px-3 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                            ${feed.category === 'Kesif' ? 'bg-blue-100 text-blue-700' :
                              feed.category === 'Kaba' ? 'bg-amber-100 text-amber-700' :
                              feed.category === 'Katkı' ? 'bg-purple-100 text-purple-700' :
                              feed.category === 'Karma' ? 'bg-green-100 text-green-700' :
                              'bg-slate-100 text-slate-700'}`}>
                            {feed.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-sm text-slate-600">
                          {feed.metabolizableEnergy?.toFixed(1)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-sm text-slate-600">
                          {feed.crudeProtein?.toFixed(1)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-sm text-slate-600">
                          {feed.costPerKg?.toFixed(2)} TL
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Run Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={runOptimization}
                disabled={selectedFeedIndices.size < 2 || isOptimizing}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                <Calculator size={18} />
                {isOptimizing ? 'Hesaplanıyor...' : 'Optimizasyonu Çalıştır'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplexOptimizer;
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import TargetConfig from './TargetConfig';
import FeedTable from './FeedTable';
import RationCalculator from './RationCalculator';
import ChartView from './ChartView';
import SimplexOptimizer from './SimplexOptimizer';
import { defaultFeeds } from '../data/defaultData';
import { storage, getTargetsKey, getFeedsKey, getRationsKey } from '../utils/storage';

const AnimalTab = ({ animalType }) => {
  const [targets, setTargets] = useState({ energy: 2.5, protein: 14 });
  const [feeds, setFeeds] = useState([]);
  const [rations, setRations] = useState([]);
  const [notification, setNotification] = useState(null);
  const [activeSection, setActiveSection] = useState('target');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTargets = storage.get(getTargetsKey(animalType), null);
    const savedFeeds = storage.get(getFeedsKey(animalType), null);
    const savedRations = storage.get(getRationsKey(animalType), null);

    if (savedTargets) setTargets(savedTargets);
    if (savedFeeds) setFeeds(savedFeeds);
    else setFeeds(defaultFeeds);
    if (savedRations) setRations(savedRations);
  }, [animalType]);

  // Save targets to localStorage whenever they change
  useEffect(() => {
    storage.set(getTargetsKey(animalType), targets);
  }, [targets, animalType]);

  // Save feeds to localStorage whenever they change
  useEffect(() => {
    storage.set(getFeedsKey(animalType), feeds);
  }, [feeds, animalType]);

  // Save rations to localStorage whenever they change
  useEffect(() => {
    storage.set(getRationsKey(animalType), rations);
  }, [rations, animalType]);

  // Show notification helper
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Calculate ration stats for charts
  const rationStats = useMemo(() => {
    if (rations.length === 0) {
      return { totalEnergy: 0, totalProtein: 0, totalWeight: 0, totalCost: 0 };
    }

    let totalWeight = 0;
    let weightedEnergy = 0;
    let weightedProtein = 0;
    let totalCost = 0;

    rations.forEach(ration => {
      const feed = feeds.find(f => f.id === ration.feedId);
      if (feed) {
        totalWeight += ration.amount;
        weightedEnergy += feed.metabolizableEnergy * ration.amount;
        weightedProtein += feed.crudeProtein * ration.amount;
        totalCost += (feed.costPerKg || 0) * ration.amount;
      }
    });

    return {
      totalEnergy: totalWeight > 0 ? weightedEnergy / totalWeight : 0,
      totalProtein: totalWeight > 0 ? weightedProtein / totalWeight : 0,
      totalWeight,
      totalCost
    };
  }, [rations, feeds]);

  // Export to Excel
  const handleExportExcel = useCallback(() => {
    import('xlsx').then(XLSX => {
      const rationData = rations.map(ration => {
        const feed = feeds.find(f => f.id === ration.feedId);
        return {
          'Yem Adı': feed?.name || 'Bilinmeyen',
          'Yem Tipi': feed?.category || 'Bilinmeyen',
          'Miktar (kg)': ration.amount,
          'Ham Protein (%)': feed?.crudeProtein || 0,
          'Metabolik Enerji (MJ/kg)': feed?.metabolizableEnergy || 0,
          'Kg Başına Maliyet (TL)': feed?.costPerKg || 0
        };
      });

      rationData.push({
        'Yem Adı': 'TOPLAM',
        'Yem Tipi': '',
        'Miktar (kg)': rationStats.totalWeight,
        'Ham Protein (%)': '',
        'Metabolik Enerji (MJ/kg)': rationStats.totalEnergy.toFixed(2),
        'Kg Başına Maliyet (TL)': rationStats.totalCost.toFixed(2)
      });

      const ws = XLSX.utils.json_to_sheet(rationData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rasyon');

      const targetsData = [
        { 'Parametre': 'Enerji Hedefi (ME)', 'Değer': targets.energy, 'Birim': 'MJ/kg' },
        { 'Parametre': 'Protein Hedefi', 'Değer': targets.protein, 'Birim': '%' }
      ];
      const wsTargets = XLSX.utils.json_to_sheet(targetsData);
      XLSX.utils.book_append_sheet(wb, wsTargets, 'Hedefler');

      XLSX.writeFile(wb, `rasyon-${animalType}-${Date.now()}.xlsx`);
      showNotification('Rasyon Excel olarak kaydedildi!');
    }).catch(err => {
      console.error('Export error:', err);
      showNotification('Excel export işlemi başarısız oldu.', 'error');
    });
  }, [rations, feeds, targets, rationStats, animalType, showNotification]);

  // Export to PDF
  const handleExportPDF = useCallback(() => {
    const getAnimalName = () => {
      switch (animalType) {
        case 'beef': return 'Besi Sığırı';
        case 'dairy': return 'Süt Sığırı';
        case 'poultry': return 'Kanatlılar';
        default: return 'Hayvan';
      }
    };

    const printContent = `
      <html>
        <head>
          <title>Rasyon Raporu - ${animalType}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #059669; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #059669; color: white; }
            .summary { margin-top: 20px; padding: 20px; background: #f0fdf4; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Rasyon Raporu</h1>
          <p><strong>Hayvan Türü:</strong> ${getAnimalName()}</p>
          <h2>Hedefler</h2>
          <p>Enerji: ${targets.energy} MJ/kg | Protein: ${targets.protein}%</p>
          <h2>Rasyon İçeriği</h2>
          <table>
            <tr>
              <th>Yem Adı</th>
              <th>Miktar (kg)</th>
              <th>Metabolik Enerji (MJ/kg)</th>
              <th>Ham Protein (%)</th>
              <th>Maliyet (TL)</th>
            </tr>
            ${rations.map(ration => {
              const feed = feeds.find(f => f.id === ration.feedId);
              const cost = (feed?.costPerKg || 0) * ration.amount;
              return `<tr>
                <td>${feed?.name || '-'}</td>
                <td>${ration.amount}</td>
                <td>${feed?.metabolizableEnergy?.toFixed(2) || '-'}</td>
                <td>${feed?.crudeProtein?.toFixed(1) || '-'}</td>
                <td>${cost.toFixed(2)}</td>
              </tr>`;
            }).join('')}
          </table>
          <div class="summary">
            <h3>Özet</h3>
            <p>Toplam Ağırlık: ${rationStats.totalWeight.toFixed(2)} kg</p>
            <p>Toplam Maliyet: ${rationStats.totalCost.toFixed(2)} TL</p>
            <p>Toplam ME: ${rationStats.totalEnergy.toFixed(2)} MJ/kg</p>
            <p>Toplam HP: ${rationStats.totalProtein.toFixed(1)}%</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    showNotification('PDF yazdırma penceresi açıldı!');
  }, [rations, feeds, targets, rationStats, animalType, showNotification]);

  // Handle adding optimized rations from Simplex
  const handleAddOptimizedRations = useCallback((optimizedRation) => {
    if (!optimizedRation) return;

    const newRations = optimizedRation
      .filter(item => item.amount > 0.001)
      .map(item => ({
        id: Date.now() + Math.random(),
        feedId: item.feed.id,
        amount: item.amount
      }));

    setRations(prev => [...prev, ...newRations]);
    showNotification(`${newRations.length} yem maddesi rasyona eklendi!`);
    setActiveSection('calculator');
  }, [showNotification]);

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl transition-all duration-300
          ${notification.type === 'error' 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="glass-card p-2 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSection('target')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
            ${activeSection === 'target' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          Kalori & Protein Ayarla
        </button>
        <button
          onClick={() => setActiveSection('feeds')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
            ${activeSection === 'feeds' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          Yem Maddeleri
        </button>
        <button
          onClick={() => setActiveSection('simplex')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
            ${activeSection === 'simplex' 
              ? 'bg-violet-600 text-white shadow-lg' 
              : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          📊 Simplex Optimizasyon
        </button>
        <button
          onClick={() => setActiveSection('calculator')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
            ${activeSection === 'calculator' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          Rasyon Hesaplayıcı
        </button>
        <button
          onClick={() => setActiveSection('chart')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
            ${activeSection === 'chart' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          Grafikler
        </button>
      </div>

      {/* Section Content */}
      {activeSection === 'target' && (
        <div className="space-y-6">
          <TargetConfig 
            animalType={animalType} 
            targets={targets} 
            onTargetsChange={setTargets} 
          />
          
          <div className="flex flex-wrap gap-4 justify-end">
            <button
              onClick={() => setActiveSection('chart')}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <CheckCircle size={18} />
              Grafiklere Git
            </button>
          </div>
        </div>
      )}

      {activeSection === 'feeds' && (
        <FeedTable
          feeds={feeds}
          onFeedsChange={setFeeds}
          onImportError={(msg) => showNotification(msg, 'error')}
          onImportSuccess={(msg) => showNotification(msg)}
        />
      )}

      {activeSection === 'simplex' && (
        <SimplexOptimizer
          feeds={feeds}
          targets={targets}
          onSelectFeed={handleAddOptimizedRations}
        />
      )}

      {activeSection === 'calculator' && (
        <div className="space-y-6">
          <RationCalculator
            feeds={feeds}
            targets={targets}
            rations={rations}
            onRationsChange={setRations}
          />
          
          <div className="flex flex-wrap gap-4 justify-end">
            <button
              onClick={handleExportExcel}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Download size={18} />
              Excel'e Aktar
            </button>
            <button
              onClick={handleExportPDF}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <FileText size={18} />
              PDF Yazdır
            </button>
          </div>
        </div>
      )}

      {activeSection === 'chart' && (
        <ChartView
          targets={targets}
          rationStats={rationStats}
          feeds={feeds}
          rations={rations}
          animalType={animalType}
        />
      )}
    </div>
  );
};

export default AnimalTab;

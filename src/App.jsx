import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewDashboard from './components/OverviewDashboard';
import AnimalTab from './components/AnimalTab';

const getTabTitle = (tabId) => {
  switch (tabId) {
    case 'overview':
      return { title: 'Genel Bakış', subtitle: 'Tüm uygulama modüllerini görüntüleyin' };
    case 'beef':
      return { title: 'Besi Sığırı (Beef Cattle)', subtitle: 'Besi sığırları için rasyon hesaplama ve yem yönetimi' };
    case 'dairy':
      return { title: 'Süt Sığırı (Dairy Cattle)', subtitle: 'Süt sığırları için laktasyon dönemlerine göre rasyon planlama' };
    case 'poultry':
      return { title: 'Kanatlılar (Poultry)', subtitle: 'Piliç ve yumurtacılar için büyüme ve verim dönemleri rasyonu' };
    default:
      return { title: 'Sudem Sevinç Final Ödevi', subtitle: '' };
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabInfo = getTabTitle(activeTab);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header title={tabInfo.title} subtitle={tabInfo.subtitle} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {activeTab === 'overview' && <OverviewDashboard />}
          {(activeTab === 'beef' || activeTab === 'dairy' || activeTab === 'poultry') && (
            <AnimalTab animalType={activeTab} />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white/70 backdrop-blur-md border-t border-slate-200/50 px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">Sudem Sevinç Final Ödevi</span> - Hayvan Besleme ve Rasyon Yönetimi Uygulaması
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tarım Bilimleri ve Hayvancılık Eğitimi için Geliştirilmiştir
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400">React + Tailwind CSS + Recharts</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-500">Sistem Aktif</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

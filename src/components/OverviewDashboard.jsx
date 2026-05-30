import { useMemo } from 'react';
import { 
  TrendingUp, Users, Beef, Milk, Bird, Calendar,
  Award, Target, Clock1, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { storage, getTargetsKey, getFeedsKey, getRationsKey } from '../utils/storage';

const OverviewDashboard = () => {
  // Gather statistics from localStorage
  const stats = useMemo(() => {
    const beefFeeds = storage.get(getFeedsKey('beef'), []);
    const dairyFeeds = storage.get(getFeedsKey('dairy'), []);
    const poultryFeeds = storage.get(getFeedsKey('poultry'), []);
    
    const beefRations = storage.get(getRationsKey('beef'), []);
    const dairyRations = storage.get(getRationsKey('dairy'), []);
    const poultryRations = storage.get(getRationsKey('poultry'), []);

    const beefTargets = storage.get(getTargetsKey('beef'), null);
    const dairyTargets = storage.get(getTargetsKey('dairy'), null);
    const poultryTargets = storage.get(getTargetsKey('poultry'), null);

    return {
      totalFeeds: {
        beef: beefFeeds.length,
        dairy: dairyFeeds.length,
        poultry: poultryFeeds.length,
        all: beefFeeds.length + dairyFeeds.length + poultryFeeds.length
      },
      totalRations: {
        beef: beefRations.length,
        dairy: dairyRations.length,
        poultry: poultryRations.length,
        all: beefRations.length + dairyRations.length + poultryRations.length
      },
      targets: {
        beef: beefTargets,
        dairy: dairyTargets,
        poultry: poultryTargets
      }
    };
  }, []);

  // Chart data
  const chartData = useMemo(() => [
    { name: 'Besi Sığırı', feeds: stats.totalFeeds.beef, rations: stats.totalRations.beef },
    { name: 'Süt Sığırı', feeds: stats.totalFeeds.dairy, rations: stats.totalRations.dairy },
    { name: 'Kanatlılar', feeds: stats.totalFeeds.poultry, rations: stats.totalRations.poultry }
  ], [stats]);

  const features = [
    {
      title: 'Besi Sığırı Rasyonları',
      description: 'Besi sığırları için optimum büyüme ve verim hedeflerine göre rasyon hazırlayın.',
      icon: Beef,
      color: 'from-amber-500 to-orange-600',
      colorBg: 'bg-amber-100',
      colorIcon: 'text-amber-600',
      path: 'beef',
      stats: `${stats.totalFeeds.beef} yem, ${stats.totalRations.beef} rasyon`
    },
    {
      title: 'Süt Sığırı Rasyonları',
      description: 'Süt sığırları için laktasyon dönemlerine göre dengeli rasyonlar oluşturun.',
      icon: Milk,
      color: 'from-blue-500 to-indigo-600',
      colorBg: 'bg-blue-100',
      colorIcon: 'text-blue-600',
      path: 'dairy',
      stats: `${stats.totalFeeds.dairy} yem, ${stats.totalRations.dairy} rasyon`
    },
    {
      title: 'Kanatlı Rasyonları',
      description: 'Piliç ve yumurtacılar için büyüme ve verim dönemlerine göre rasyon planlayın.',
      icon: Bird,
      color: 'from-emerald-500 to-teal-600',
      colorBg: 'bg-emerald-100',
      colorIcon: 'text-emerald-600',
      path: 'poultry',
      stats: `${stats.totalFeeds.poultry} yem, ${stats.totalRations.poultry} rasyon`
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-8 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Hoş Geldiniz! 👋
            </h1>
            <p className="text-emerald-100 text-lg">
              Sudem Sevinç Final Ödevi - Hayvan Besleme ve Rasyon Yönetimi Uygulaması
            </p>
            <p className="text-emerald-200/80 text-sm mt-2">
              Tarım Bilimleri ve Hayvancılık öğrencileri/profesyonelleri için kapsamlı bir rasyon planlama aracı
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-6 py-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <div className="text-3xl font-bold text-white">{stats.totalFeeds.all}</div>
              <div className="text-emerald-100 text-sm">Toplam Yem</div>
            </div>
            <div className="text-center px-6 py-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <div className="text-3xl font-bold text-white">{stats.totalRations.all}</div>
              <div className="text-emerald-100 text-sm">Rasyon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Target size={18} className="text-white" />
            </div>
            <span className="text-sm text-slate-500">Aktif Oturum</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">3</div>
          <div className="text-xs text-slate-500 mt-1">Modül Aktif</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity size={18} className="text-white" />
            </div>
            <span className="text-sm text-slate-500">Veriler</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">localStorage</div>
          <div className="text-xs text-slate-500 mt-1">Kayıtlı Veri</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clock1 size={18} className="text-white" />
            </div>
            <span className="text-sm text-slate-500">Tarih</span>
          </div>
          <div className="text-lg font-bold text-slate-800">{new Date().toLocaleDateString('tr-TR')}</div>
          <div className="text-xs text-slate-500 mt-1">Türkiye Saat Dilimi</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Award size={18} className="text-white" />
            </div>
            <span className="text-sm text-slate-500">Versiyon</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">v1.0</div>
          <div className="text-xs text-slate-500 mt-1">Final Sürümü</div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Uygulama Modülleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.path}
                className="glass-card p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${feature.colorBg} ${feature.colorIcon}`}>
                    {feature.path.charAt(0).toUpperCase() + feature.path.slice(1)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{feature.description}</p>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{feature.stats}</span>
                    <span className="text-emerald-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                      Git →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Yem Kütüphanesi</h3>
              <p className="text-slate-500 text-sm">Hayvan türlerine göre yem dağılımı</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                <Bar dataKey="feeds" fill="#10b981" radius={[4, 4, 0, 0]} name="Yem Sayısı">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : index === 1 ? '#3b82f6' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Rasyon İçerikleri</h3>
              <p className="text-slate-500 text-sm">Hayvan türlerine göre rasyon sayısı</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                <Bar dataKey="rations" fill="#6366f1" radius={[4, 4, 0, 0]} name="Rasyon Sayısı">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : index === 1 ? '#3b82f6' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-slate-800 mb-4">Uygulama Hakkında</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 mb-1">Gerçek Zamanlı Hesaplama</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Rasyon girdiğinizde anlık olarak enerji ve protein değerlerini hesaplar
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📁</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 mb-1">Excel Entegrasyonu</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Yem maddelerinizi Excel'den içe aktarın ve rasyonlarınızı dışa aktarın
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💾</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 mb-1">Veri Kalıcılığı</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                localStorage ile verileriniz tarayıcıda saklanır, sayfa yenilense bile korunur
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;

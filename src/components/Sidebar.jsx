import { 
  LayoutDashboard, 
  Beef, 
  Milk, 
  Bird, 
  Settings,
  Info
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'beef', label: 'Besi Sığırı', icon: Beef },
    { id: 'dairy', label: 'Süt Sığırı', icon: Milk },
    { id: 'poultry', label: 'Kanatlılar', icon: Bird },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-white font-bold text-lg">SS</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Sudem Sevinç</h1>
            <p className="text-emerald-400/80 text-xs font-medium">Final Ödevi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-emerald-600/30 text-emerald-400 border-l-4 border-emerald-400 shadow-lg shadow-emerald-500/10' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-l-4 border-transparent'
                  }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} 
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-500 text-sm">
          <Settings size={18} />
          <span>Ayarlar</span>
        </div>
        <div className="mt-2 px-4 py-3 bg-slate-800/50 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Info size={14} />
            <span>Hayvan Besleme ve Rasyon Yönetimi</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

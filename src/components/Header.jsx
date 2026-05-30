import { Bell, Search, User } from 'lucide-react';

const Header = ({ title, subtitle }) => {
  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/50 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Ara..." 
              className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200 w-64"
            />
          </div>
          <button className="relative p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors duration-200">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors duration-200">
            <User size={18} />
            <span className="font-medium text-sm">Kullanıcı</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

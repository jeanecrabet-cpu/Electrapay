
import React from 'react';
import { Zap, History, HelpCircle, LayoutDashboard, Bell, RefreshCcw, Wifi, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isGridActive?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isGridActive = false }) => {
  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed left-0 top-0 bottom-0 p-6 shadow-sm z-40">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-600/20">
              <Zap className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ElectraPay</h1>
          </div>
        </div>

        <nav className="space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Accueil" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
          <NavItem 
            icon={<Zap size={18} />} 
            label="Recharger" 
            active={activeTab === 'recharge'} 
            onClick={() => setActiveTab('recharge')} 
          />
          <NavItem 
            icon={<Bell size={18} />} 
            label="Alertes & Auto" 
            active={activeTab === 'alerts'} 
            onClick={() => setActiveTab('alerts')} 
          />
          <NavItem 
            icon={<UserIcon size={18} />} 
            label="Mon Profil" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statut Réseau</p>
            <div className={`w-2 h-2 rounded-full ${isGridActive ? 'bg-blue-500 animate-ping' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {isGridActive ? 'SYNCHRONISATION...' : 'EN LIGNE'}
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
            <Zap className="text-white w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">ElectraPay</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
            <div className={`w-1.5 h-1.5 rounded-full bg-green-500 ${isGridActive ? 'animate-ping' : ''}`}></div>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Actif</span>
          </div>
          <button onClick={() => setActiveTab('profile')} className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <UserIcon size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full animate-slide-up">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-3 px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <MobileNavItem 
          icon={<LayoutDashboard size={22} />} 
          label="Accueil" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
        />
        <MobileNavItem 
          icon={<Zap size={22} />} 
          label="Recharge" 
          active={activeTab === 'recharge'} 
          onClick={() => setActiveTab('recharge')} 
        />
        <MobileNavItem 
          icon={<Bell size={22} />} 
          label="Auto" 
          active={activeTab === 'alerts'} 
          onClick={() => setActiveTab('alerts')} 
        />
        <MobileNavItem 
          icon={<UserIcon size={22} />} 
          label="Profil" 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
        />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

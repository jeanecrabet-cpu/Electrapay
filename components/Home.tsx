
import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, Smartphone, ArrowRight, Wifi, Bell, TrendingDown, Activity, Gauge, X, Info, Calendar, TrendingUp, DollarSign, Lightbulb, CheckCircle2, Copy, RefreshCw, ChevronRight, Bot, Sparkles, MessageSquare, Cpu, Loader2, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MeterType, AlertSettings, ConsumptionData, Transaction, AutoRechargeSettings } from '../types';
import { getQuickInsight } from '../services/gemini';

interface HomeProps {
  userName: string;
  meterNumber: string;
  walletBalance: number;
  onStartRecharge: (repeatTx?: Transaction) => void;
  onViewHistory: () => void;
  onOpenSupport: () => void;
  onTriggerSync: () => void;
  onWalletTopUp: () => void;
  isSyncing: boolean;
  lastSyncTime: number;
  recentTransactions: Transaction[];
  currentCredit: number;
  alertSettings: AlertSettings;
  autoRechargeSettings: AutoRechargeSettings;
  consumption: ConsumptionData;
  history: ConsumptionData[];
}

const CustomTooltip = ({ active, payload, period }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    let timeLabel = '';
    if (period === '24h') {
      timeLabel = new Date(data.timestamp).toLocaleTimeString();
    } else {
      timeLabel = data.label;
    }

    return (
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xl text-slate-900 text-[11px] space-y-2">
        <p className="font-bold border-b border-slate-100 pb-2 mb-2 text-blue-600 flex items-center justify-between gap-4">
          <span>{timeLabel}</span>
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-6">
            <span className="text-slate-500 font-medium">Consommation</span>
            <span className="font-bold text-slate-900">{data.kwh.toFixed(3)} kWh</span>
          </div>
          {period === '24h' && (
            <>
              <div className="flex justify-between gap-6">
                <span className="text-slate-500 font-medium">Puissance</span>
                <span className="font-bold text-slate-900">{data.power} W</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-slate-500 font-medium">Tension</span>
                <span className="font-bold text-slate-900">{data.voltage} V</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-slate-500 font-medium">Intensité</span>
                <span className="font-bold text-slate-900">{data.current.toFixed(2)} A</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const Home: React.FC<HomeProps> = ({ 
  userName, meterNumber, walletBalance, onStartRecharge, onViewHistory, onOpenSupport, onTriggerSync, onWalletTopUp, isSyncing, lastSyncTime, recentTransactions, currentCredit, 
  alertSettings, autoRechargeSettings, consumption, history 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("Analyse de votre consommation en cours...");
  const [chartPeriod, setChartPeriod] = useState<'24h' | 'week' | 'month' | 'year'>('24h');
  
  const isLowCredit = alertSettings.enabled && currentCredit <= alertSettings.threshold;
  const creditPercentage = Math.min(100, (currentCredit / 200) * 100);

  const avgPower = history.length > 0 ? history.reduce((acc, cur) => acc + cur.power, 0) / history.length : 0;
  const effectivePower = Math.max(10, consumption.power);
  const peakPower = history.length > 0 ? Math.max(...history.map(h => h.power)) : 0;
  const autonomyHours = (currentCredit / (effectivePower / 1000));
  const daysLeft = autonomyHours / 24;
  const estimatedMonthlyCost = (avgPower / 1000) * 24 * 30 * 79;

  const timeSinceSync = Math.floor((Date.now() - lastSyncTime) / 1000);

  useEffect(() => {
    const fetchInsight = async () => {
      const tip = await getQuickInsight(currentCredit, consumption.power);
      setAiInsight(tip);
    };
    fetchInsight();
    const interval = setInterval(fetchInsight, 30000);
    return () => clearInterval(interval);
  }, [currentCredit > 0]);

  const getChartData = () => {
    if (chartPeriod === '24h') {
      return history.map(d => ({ ...d, kwh: d.power / 1000, label: new Date(d.timestamp).toLocaleTimeString() }));
    }
    
    const data = [];
    const now = Date.now();
    
    if (chartPeriod === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        data.push({
          timestamp: date.getTime(),
          label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          kwh: Math.random() * 15 + 5,
        });
      }
    } else if (chartPeriod === 'month') {
      for (let i = 30; i >= 0; i -= 3) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        data.push({
          timestamp: date.getTime(),
          label: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          kwh: Math.random() * 45 + 15,
        });
      }
    } else if (chartPeriod === 'year') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.push({
          timestamp: date.getTime(),
          label: date.toLocaleDateString('fr-FR', { month: 'short' }),
          kwh: Math.random() * 300 + 150,
        });
      }
    }
    return data;
  };

  return (
    <div className="space-y-8 animate-slide-up relative">
      {/* Alerte Crédit Faible */}
      {isLowCredit && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse-soft">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
              <Bell size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700 leading-tight">Alerte Énergie !</h3>
              <p className="text-sm text-red-600">Votre solde est descendu à <span className="font-mono font-bold">{currentCredit.toFixed(1)} kWh</span>.</p>
            </div>
          </div>
          <button 
            onClick={() => onStartRecharge()}
            className="w-full md:w-auto bg-red-600 text-white px-8 py-3 rounded-xl font-medium shadow-md shadow-red-600/20 hover:bg-red-700 transition-colors"
          >
            Recharger maintenant
          </button>
        </div>
      )}

      {/* Gemini AI & Smart Grid Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl p-1 shadow-sm overflow-hidden group border border-slate-200">
          <div className="bg-slate-50 rounded-[1.4rem] p-5 h-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center relative shrink-0">
                <Bot className="text-blue-600" size={24} />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="text-orange-500 w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Electra Advisor (AI)</h3>
                <p className="text-xs font-medium text-slate-700 leading-tight italic line-clamp-2">"{aiInsight}"</p>
              </div>
            </div>
            <button onClick={onOpenSupport} className="shrink-0 p-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all border border-slate-200 shadow-sm"><MessageSquare size={18} /></button>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-1 shadow-sm overflow-hidden border border-slate-200">
          <div className="bg-slate-50 rounded-[1.4rem] p-5 h-full flex items-center justify-between gap-4 relative">
            {isSyncing && (
               <div className="absolute inset-x-5 bottom-0 h-0.5 overflow-hidden">
                 <div className="w-full h-full bg-blue-100 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500 animate-[loading_1.5s_infinite] origin-left"></div>
                 </div>
               </div>
            )}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative shrink-0 bg-blue-100">
                <Cpu size={24} className={`${isSyncing ? 'text-blue-600 animate-spin' : 'text-blue-600'}`} />
                <div className={`absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full ${isSyncing ? 'animate-pulse' : ''}`}></div>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Réseau Intelligent</h3>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isSyncing ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`}>
                  {isSyncing ? 'Sync Grid Active' : `Sync: Il y a ${timeSinceSync}s`}
                </p>
              </div>
            </div>
            <button 
              disabled={isSyncing}
              onClick={onTriggerSync}
              className={`shrink-0 p-3 rounded-xl transition-all border shadow-sm ${isSyncing ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200'}`}
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </section>
      </div>

      {/* Hero & Real-time Consumption */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[350px] shadow-lg">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold mb-4 border uppercase tracking-widest bg-green-500/20 text-green-400 border-green-500/30">
                Smart Grid Pilot - Connecté
              </div>
              <h2 className="text-3xl font-bold mb-1 tracking-tight">Bonjour, {userName.split(' ')[0]}</h2>
              <p className="text-slate-400 text-sm mb-6 flex items-center gap-2 font-mono">
                <Wifi size={14} className="text-green-400" /> {meterNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Charge Actuelle</p>
              <p className="text-4xl font-mono text-green-400">{consumption.power} <span className="text-lg font-sans text-green-500/50">W</span></p>
            </div>
          </div>
          
          <div className="relative z-10 flex justify-end mt-2">
            <div className="bg-slate-800/50 p-1 rounded-xl flex gap-1 border border-slate-700/50">
              {[
                { id: '24h', label: '24H' },
                { id: 'week', label: '7J' },
                { id: 'month', label: '30J' },
                { id: 'year', label: '1AN' }
              ].map(period => (
                <button
                  key={period.id}
                  onClick={() => setChartPeriod(period.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${chartPeriod === period.id ? 'bg-green-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 h-32 w-full mt-4 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip period={chartPeriod} />} cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="kwh" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorPower)" animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="relative z-10 flex justify-between text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest px-1">
            <span>Grid Analytics Direct</span>
            <span className="text-green-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full bg-green-400 ${isSyncing ? 'animate-ping' : ''}`}></span> Réseau CIE Stable
            </span>
          </div>
          
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 blur-[100px] rounded-full bg-green-500/20" />
        </div>

        {/* Card Solde en kWh & Portefeuille */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden h-[180px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 -mr-16 -mt-16 rounded-full" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Énergie Disponible</p>
                <h3 className={`text-4xl font-mono ${isLowCredit ? 'text-red-600' : 'text-slate-900'}`}>
                  {currentCredit.toFixed(1)} <span className="text-lg font-sans text-slate-400">kWh</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mt-1">≈ {(currentCredit * 79).toLocaleString()} FCFA</p>
              </div>
              <div className={`p-3 rounded-2xl ${isLowCredit ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                <Gauge size={24} />
              </div>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${isLowCredit ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${creditPercentage}%` }} />
              </div>
              <button onClick={() => onStartRecharge()} className="w-full text-white py-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">Acheter de l'énergie</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden h-[160px] border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mon Portefeuille</p>
                  <h3 className="text-3xl font-mono text-slate-900">
                    {walletBalance.toLocaleString()} <span className="text-sm font-sans text-slate-500">FCFA</span>
                  </h3>
                </div>
                <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                  <Wallet size={24} />
                </div>
             </div>
             <button onClick={onWalletTopUp} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-green-600/20">
               Recharger le solde
             </button>
          </div>
        </div>
      </section>

      {/* Mesures Techniques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Zap className="text-orange-500" />} title="Tension Secteur" value={`${consumption.voltage} V`} subtitle="Flux Stable" />
        <StatCard icon={<Activity className="text-blue-600" />} title="Intensité" value={`${consumption.current.toFixed(1)} A`} subtitle="Charge Temps Réel" />
        <StatCard icon={<CreditCard className="text-green-600" />} title="Estimation Autonomie" value={currentCredit > 0 ? `${(currentCredit / (effectivePower / 1000)).toFixed(1)} h` : '0 h'} subtitle="Jusqu'à épuisement" />
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Rechargements Intelligents</h3>
          <button onClick={onViewHistory} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-900 transition-colors">Tout voir <ChevronRight size={14} /></button>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tx.isWalletTopUp ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {tx.isWalletTopUp ? <Wallet size={20} /> : <Cpu size={20} />}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 leading-none">{tx.isWalletTopUp ? 'Approvisionnement Compte' : tx.meterNumber}</p>
                    <div className="flex items-center gap-2">
                       <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${tx.isWalletTopUp ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                         {tx.isWalletTopUp ? 'Portefeuille' : 'Mise à jour Auto'}
                       </span>
                       <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                         {new Date(tx.date).toLocaleDateString()} • {tx.operator}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                   <div className="text-right">
                      <p className={`font-mono font-bold text-lg ${tx.isWalletTopUp ? 'text-green-600' : 'text-slate-900'}`}>+{tx.amount.toLocaleString()} FCFA</p>
                      {!tx.isWalletTopUp && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">≈ {(tx.amount / 79).toFixed(1)} kWh</p>}
                   </div>
                   
                   {!tx.isWalletTopUp && (
                     <div className="flex gap-2">
                       <button onClick={() => onStartRecharge(tx)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-1.5 text-[10px] font-medium shadow-sm">
                         <RefreshCw size={12} />
                         Re-créditer
                       </button>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
            <Zap className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-500 font-medium">Aucune activité pour le moment...</p>
          </div>
        )}
      </section>

      {/* Modal Détails Avancés */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowDetails(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-8 pb-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                  <Info size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Analyses Grid</h2>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailStat icon={<Calendar className="text-blue-600" />} label="Autonomie Estimée" value={daysLeft >= 1 ? `${daysLeft.toFixed(1)} Jours` : `${autonomyHours.toFixed(1)} Heures`} desc="Basé sur la charge actuelle" />
                <DetailStat icon={<TrendingUp className="text-orange-500" />} label="Pic de Puissance" value={`${peakPower} W`} desc="Sur les dernières 2 mins" />
                <DetailStat icon={<Activity className="text-purple-600" />} label="Conso. Moyenne" value={`${avgPower.toFixed(0)} W`} desc="Moyenne glissante" />
                <DetailStat icon={<DollarSign className="text-green-600" />} label="Projection Mensuelle" value={`${estimatedMonthlyCost.toFixed(0).toLocaleString()} FCFA`} desc="Estimation 30 jours" />
              </div>

              <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 space-y-4">
                <div className="flex items-center gap-3 text-blue-800">
                  <Lightbulb size={24} className="animate-pulse" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Optimisation Grid</h3>
                </div>
                <p className="text-sm text-blue-900/80 leading-relaxed font-medium">
                  Votre compteur est piloté par le Smart Grid. Le rechargement à distance assure une continuité de service sans intervention manuelle sur le clavier.
                </p>
              </div>

              <button onClick={() => { setShowDetails(false); onStartRecharge(); }} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                Effectuer une recharge intelligente
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.5); }
          100% { transform: scaleX(1); }
        }
      `}} />
    </div>
  );
};

const DetailStat = ({ icon, label, value, desc }: { icon: any, label: string, value: string, desc: string }) => (
  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-1">
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">{icon}</div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    </div>
    <p className="text-xl font-mono font-bold text-slate-900">{value}</p>
    <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
  </div>
);

const StatCard = ({ icon, title, value, subtitle }: { icon: any, title: string, value: string, subtitle: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-lg font-mono font-bold text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>
    </div>
  </div>
);

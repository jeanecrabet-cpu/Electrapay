
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { RechargeForm } from './components/RechargeForm';
import { GeminiSupport } from './components/GeminiSupport';
import { AlertSettings } from './components/AlertSettings';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { NotificationPreferences } from './components/NotificationPreferences';
import { SecuritySettings } from './components/SecuritySettings';
import { MeterManagement } from './components/MeterManagement';
import { ConsumptionHistory } from './components/ConsumptionHistory';
import { DatabaseViewer } from './components/DatabaseViewer';
import { AdminDashboard } from './components/AdminDashboard';
import { Transaction, Operator, AlertSettings as AlertSettingsType, AutoRechargeSettings, ConsumptionData, MeterType, ScheduledRecharge, User, NotificationPreferences as NotificationPrefsType, SecuritySettings as SecuritySettingsType, MeterEntry } from './types';
import { OperatorIcon } from './components/OperatorIcon';
import { History, Zap, CheckCircle2, RefreshCcw, Calendar, ArrowLeft, Filter } from 'lucide-react';
import { generateRechargeToken } from './services/gemini';
import { api } from './services/api';

const TARIFF_PER_KWH = 79;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [previousTab, setPreviousTab] = useState('home');

  const handleNavigate = (tab: string) => {
    setPreviousTab(activeTab);
    setActiveTab(tab);
  };

  const handleBack = () => {
    setActiveTab(previousTab);
    setPreviousTab('home'); // Reset to home as fallback
  };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentCredit, setCurrentCredit] = useState<number>(70.5); 
  const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionData[]>([]);
  const [scheduledRecharges, setScheduledRecharges] = useState<ScheduledRecharge[]>([]);
  const [consumptionStats, setConsumptionStats] = useState<any[]>([]);
  const [showAutoToast, setShowAutoToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', sub: '', icon: 'refresh' });
  const [repeatTransaction, setRepeatTransaction] = useState<Transaction | null>(null);
  const [isGridSyncing, setIsGridSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const [historyFilterOperator, setHistoryFilterOperator] = useState<string>('all');
  const [historyFilterStatus, setHistoryFilterStatus] = useState<string>('all');
  const [historyView, setHistoryView] = useState<'transactions' | 'consumption'>('transactions');
  
  const [apiError, setApiError] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  const showError = (message: string) => {
    setApiError({ message, show: true });
    setTimeout(() => setApiError({ message: '', show: false }), 5000);
  };

  const [currentConsumption, setCurrentConsumption] = useState<ConsumptionData>({
    power: 1200,
    voltage: 228,
    current: 5.2,
    timestamp: Date.now()
  });
  
  const [alertSettings, setAlertSettings] = useState<AlertSettingsType>({
    enabled: true,
    threshold: 10,
    lastNotified: null,
    soundEnabled: true,
    vibrateEnabled: true,
    volume: 70,
    vibratePattern: 'short'
  });

  const [autoRechargeSettings, setAutoRechargeSettings] = useState<AutoRechargeSettings>({
    enabled: false,
    amount: 5000,
    operator: Operator.ORANGE,
    triggerThreshold: 15,
    soundEnabled: true,
    vibrateEnabled: true,
    volume: 80,
    vibratePattern: 'short'
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPrefsType>({
    channels: { sms: true, push: true, email: false },
    categories: { transactions: true, alerts: true, tips: true }
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsType>({
    biometricLock: true,
    twoFactorAuth: true,
    dataSharing: true
  });

  const isProcessingRef = useRef(false);

  const triggerGridSync = () => {
    if (isGridSyncing) return;
    setIsGridSyncing(true);
    setTimeout(() => {
      setIsGridSyncing(false);
      setLastSyncTime(Date.now());
      setCurrentCredit(prev => prev + (Math.random() * 0.05 - 0.025));
    }, 2500);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('electrapay_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      
      // Load data from API
      api.login(u.phone, u.password || '123456').then(({ user: apiUser, settings }) => {
        if (apiUser) {
          setUser(apiUser);
          localStorage.setItem('electrapay_user', JSON.stringify({...apiUser, password: u.password || '123456'}));
          
          if (settings) {
            setAlertSettings(settings.alertSettings);
            setAutoRechargeSettings(settings.autoRechargeSettings);
            setNotificationPreferences(settings.notificationPreferences);
            setSecuritySettings(settings.securitySettings);
            setCurrentCredit(settings.currentCredit);
          }

          api.getTransactions(apiUser.id).then(setTransactions).catch((err) => showError(err.message));
          api.getScheduled(apiUser.id).then(setScheduledRecharges).catch((err) => showError(err.message));
          api.getConsumptionStats(apiUser.id).then(setConsumptionStats).catch((err) => showError(err.message));
        }
      }).catch((err) => {
        showError(err.message);
        if (err.message.includes('Identifiants incorrects') || err.message.includes('réinitialiser')) {
          handleLogout();
        }
      });
    }

    const interval = setInterval(() => {
      const basePower = 800;
      const variation = Math.sin(Date.now() / 10000) * 400;
      const noise = (Math.random() - 0.5) * 50;
      const power = Math.max(100, Math.round(basePower + variation + noise));
      const voltage = 220 + Math.round(Math.random() * 15);
      const current = power / voltage;

      const newReading: ConsumptionData = { power, voltage, current, timestamp: Date.now() };

      setCurrentConsumption(newReading);
      setConsumptionHistory(prev => [...prev, newReading].slice(-40));

      const kWhConsumedPerSecond = (power / 1000) / 3600;
      setCurrentCredit(prev => Math.max(0, prev - kWhConsumedPerSecond));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isProcessingRef.current) return;
      const now = new Date();
      const due = scheduledRecharges.find(s => s.status === 'pending' && new Date(s.date) <= now);
      if (due) {
        executeScheduled(due);
        return;
      }
      if (autoRechargeSettings.enabled && currentCredit <= autoRechargeSettings.triggerThreshold) {
        executeThresholdRecharge();
      }
    }, 2000);

    localStorage.setItem('electrapay_current_credit_kwh', currentCredit.toString());
    localStorage.setItem('electrapay_scheduled', JSON.stringify(scheduledRecharges));
    return () => clearInterval(timer);
  }, [currentCredit, autoRechargeSettings.enabled, autoRechargeSettings.triggerThreshold, scheduledRecharges]);

  const handleRegister = async (newUser: User & { password?: string }) => {
    try {
      const { user: apiUser, settings } = await api.register(newUser.phone, newUser.name, newUser.password, newUser.defaultMeter);
      if (apiUser) {
        setUser(apiUser);
        localStorage.setItem('electrapay_user', JSON.stringify({...apiUser, password: newUser.password}));
        
        if (settings) {
          setAlertSettings(settings.alertSettings);
          setAutoRechargeSettings(settings.autoRechargeSettings);
          setNotificationPreferences(settings.notificationPreferences);
          setSecuritySettings(settings.securitySettings);
          setCurrentCredit(settings.currentCredit);
        }
        
        try {
          const txs = await api.getTransactions(apiUser.id);
          setTransactions(txs);
        } catch (err: any) {
          showError(err.message);
        }

        try {
          const scheduled = await api.getScheduled(apiUser.id);
          setScheduledRecharges(scheduled);
        } catch (err: any) {
          showError(err.message);
        }

        try {
          const stats = await api.getConsumptionStats(apiUser.id);
          setConsumptionStats(stats);
        } catch (err: any) {
          showError(err.message);
        }
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleLogin = async (phone: string, password?: string) => {
    try {
      const { user: apiUser, settings } = await api.login(phone, password);
      if (apiUser) {
        setUser(apiUser);
        localStorage.setItem('electrapay_user', JSON.stringify({...apiUser, password}));
        
        if (settings) {
          setAlertSettings(settings.alertSettings);
          setAutoRechargeSettings(settings.autoRechargeSettings);
          setNotificationPreferences(settings.notificationPreferences);
          setSecuritySettings(settings.securitySettings);
          setCurrentCredit(settings.currentCredit);
        }
        
        try {
          const txs = await api.getTransactions(apiUser.id);
          setTransactions(txs);
        } catch (err: any) {
          showError(err.message);
        }

        try {
          const scheduled = await api.getScheduled(apiUser.id);
          setScheduledRecharges(scheduled);
        } catch (err: any) {
          showError(err.message);
        }

        try {
          const stats = await api.getConsumptionStats(apiUser.id);
          setConsumptionStats(stats);
        } catch (err: any) {
          showError(err.message);
        }
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('electrapay_user');
    setUser(null);
    setActiveTab('home');
  };

  const handleWalletTopUp = async (amount: number, operator: Operator) => {
    if (!user) return;
    const newTx: Transaction = {
      id: `TOPUP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      meterNumber: 'Electra Wallet',
      amount,
      operator,
      meterType: MeterType.SMART,
      token: 'SOLDE RECHARGÉ',
      date: new Date().toISOString(),
      status: 'success',
      isWalletTopUp: true
    };
    
    try {
      await api.saveTransaction(user.id, newTx);
      const updatedUser = { ...user, walletBalance: user.walletBalance + amount };
      setUser(updatedUser);
      localStorage.setItem('electrapay_user', JSON.stringify(updatedUser));
      
      setTransactions(prev => [newTx, ...prev]);
      setToastMessage({ title: 'Portefeuille rechargé !', sub: `+${amount.toLocaleString()} FCFA ajoutés avec succès.`, icon: 'refresh' });
      setShowAutoToast(true);
      setTimeout(() => setShowAutoToast(false), 4000);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const executeThresholdRecharge = () => {
    if (isProcessingRef.current || !user) return;
    const useWallet = user.walletBalance >= autoRechargeSettings.amount;
    const op = useWallet ? Operator.WALLET : autoRechargeSettings.operator;

    isProcessingRef.current = true;
    setTimeout(() => {
      const newTx = createTx(autoRechargeSettings.amount, op, true);
      handleNewTransaction(newTx);
      setToastMessage({ 
        title: 'Auto-recharge réussie !', 
        sub: `Seuil intelligent atteint. Payé via ${useWallet ? 'Portefeuille' : op}.`,
        icon: 'refresh'
      });
      setShowAutoToast(true);
      setTimeout(() => setShowAutoToast(false), 5000);
      isProcessingRef.current = false;
    }, 2000);
  };

  const executeScheduled = (scheduled: ScheduledRecharge) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setToastMessage({ title: 'Simulation lancée...', sub: `Traitement de votre recharge programmée.`, icon: 'refresh' });
    setShowAutoToast(true);

    setTimeout(async () => {
      try {
        const newTx = createTx(scheduled.amount, scheduled.operator, true);
        await handleNewTransaction(newTx);
        setScheduledRecharges(prev => prev.map(s => s.id === scheduled.id ? { ...s, status: 'completed' } : s));
        await api.updateScheduledStatus(scheduled.id, 'completed');
        setToastMessage({ title: 'Recharge programmée effectuée !', sub: `La recharge de ${scheduled.amount.toLocaleString()} FCFA est validée.`, icon: 'calendar' });
        setTimeout(() => setShowAutoToast(false), 5000);
      } catch (err: any) {
        showError(err.message);
      } finally {
        isProcessingRef.current = false;
      }
    }, 2000);
  };

  const createTx = (amount: number, operator: Operator, isAuto: boolean) => {
    const defaultMeter = user?.meters?.find(m => m.isDefault)?.number || user?.defaultMeter || '0000 000 0000';
    return {
      id: `${isAuto ? 'AUTO' : 'MANUAL'}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      meterNumber: defaultMeter,
      amount,
      operator,
      meterType: MeterType.SMART,
      token: generateRechargeToken(),
      date: new Date().toISOString(),
      status: 'success' as const
    };
  };

  const handleNewTransaction = async (tx: Transaction) => {
    if (!user) return;
    
    try {
      await api.saveTransaction(user.id, tx);
      
      let updatedUser = { ...user };
      if (tx.operator === Operator.WALLET) {
        updatedUser.walletBalance -= tx.amount;
      }
      
      setUser(updatedUser);
      localStorage.setItem('electrapay_user', JSON.stringify(updatedUser));

      setTransactions(prev => [tx, ...prev]);
      
      const kWhAdded = tx.amount / TARIFF_PER_KWH;
      const newCredit = currentCredit + kWhAdded;
      setCurrentCredit(newCredit);
      
      try {
        await api.updateSettings(user.id, { currentCredit: newCredit });
      } catch (err: any) {
        showError(err.message);
      }
      
      setRepeatTransaction(null);
    } catch (err: any) {
      showError(err.message);
      throw err; // Re-throw so callers can handle it if needed
    }
  };

  const updateAlertSettings = async (settings: AlertSettingsType) => {
    if (!user) return;
    setAlertSettings(settings);
    try {
      await api.updateSettings(user.id, { alertSettings: settings });
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateAutoSettings = async (settings: AutoRechargeSettings) => {
    if (!user) return;
    setAutoRechargeSettings(settings);
    try {
      await api.updateSettings(user.id, { autoRechargeSettings: settings });
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateNotificationPrefs = async (prefs: NotificationPrefsType) => {
    if (!user) return;
    setNotificationPreferences(prefs);
    try {
      await api.updateSettings(user.id, { notificationPreferences: prefs });
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateSecuritySettings = async (settings: SecuritySettingsType) => {
    if (!user) return;
    setSecuritySettings(settings);
    try {
      await api.updateSettings(user.id, { securitySettings: settings });
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateMeters = async (meters: MeterEntry[]) => {
    if (!user) return;
    const defaultMeter = meters.find(m => m.isDefault)?.number || meters[0]?.number || user.defaultMeter;
    const updatedUser = { ...user, meters, defaultMeter };
    setUser(updatedUser);
    localStorage.setItem('electrapay_user', JSON.stringify(updatedUser));
    
    // For simplicity, we just add the new meter if it doesn't exist, 
    // but a real app would sync the whole list.
    const lastMeter = meters[meters.length - 1];
    if (lastMeter) {
      try {
        await api.addMeter(user.id, lastMeter);
      } catch (err: any) {
        showError(err.message);
      }
    }
  };

  const handleStartRecharge = (repeatTx?: Transaction) => {
    if (repeatTx) setRepeatTransaction(repeatTx);
    else setRepeatTransaction(null);
    handleNavigate('recharge');
  };

  if (!user) {
    return <Auth onRegister={handleRegister} onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home 
          userName={user.name}
          meterNumber={user.meters?.find(m => m.isDefault)?.number || user.defaultMeter}
          walletBalance={user.walletBalance}
          onStartRecharge={handleStartRecharge} 
          onViewHistory={() => handleNavigate('history')}
          onOpenSupport={() => handleNavigate('help')}
          onTriggerSync={triggerGridSync}
          onWalletTopUp={() => handleNavigate('profile')}
          isSyncing={isGridSyncing}
          lastSyncTime={lastSyncTime}
          recentTransactions={transactions.slice(0, 5)} 
          currentCredit={currentCredit} 
          alertSettings={alertSettings}
          autoRechargeSettings={autoRechargeSettings}
          consumption={currentConsumption}
          history={consumptionHistory}
        />;
      case 'recharge':
        return <RechargeForm 
          walletBalance={user.walletBalance}
          onSuccess={handleNewTransaction} 
          onReturnHome={() => handleNavigate('home')}
          repeatData={repeatTransaction}
          defaultMeter={user.meters?.find(m => m.isDefault)?.number || user.defaultMeter}
          meters={user.meters}
        />;
      case 'alerts':
        return <AlertSettings 
          settings={alertSettings} autoSettings={autoRechargeSettings} scheduledRecharges={scheduledRecharges}
          onUpdateAlerts={updateAlertSettings} onUpdateAuto={updateAutoSettings}
          onAddScheduled={async (r) => {
            if (!user) return;
            setScheduledRecharges(p => [...p, r]);
            try {
              await api.addScheduled(user.id, r);
            } catch (err: any) {
              showError(err.message);
              setScheduledRecharges(p => p.filter(s => s.id !== r.id));
            }
          }}
          onRemoveScheduled={async (id) => {
            const previous = [...scheduledRecharges];
            setScheduledRecharges(p => p.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
            try {
              await api.updateScheduledStatus(id, 'cancelled');
            } catch (err: any) {
              showError(err.message);
              setScheduledRecharges(previous);
            }
          }}
          onSimulateScheduled={executeScheduled}
          onClearHistory={async () => {
            const toKeep = scheduledRecharges.filter(s => s.status === 'pending');
            const toDelete = scheduledRecharges.filter(s => s.status !== 'pending');
            const previous = [...scheduledRecharges];
            setScheduledRecharges(toKeep);
            try {
              for (const s of toDelete) {
                await api.deleteScheduled(s.id);
              }
            } catch (err: any) {
              showError(err.message);
              setScheduledRecharges(previous);
            }
          }}
          onBack={() => handleNavigate('home')}
        />;
      case 'notifications':
        return <NotificationPreferences 
          preferences={notificationPreferences} 
          onUpdate={updateNotificationPrefs} 
          onBack={handleBack} 
        />;
      case 'security':
        return <SecuritySettings 
          settings={securitySettings} 
          onUpdate={updateSecuritySettings} 
          onBack={handleBack} 
        />;
      case 'meters':
        return <MeterManagement 
          meters={user.meters || []} 
          onUpdate={updateMeters} 
          onBack={handleBack} 
        />;
      case 'history': {
        const filteredTransactions = transactions.filter(tx => {
          if (historyFilterOperator !== 'all' && tx.operator !== historyFilterOperator) return false;
          if (historyFilterStatus !== 'all' && tx.status !== historyFilterStatus) return false;
          return true;
        });

        return (
          <div className="space-y-6 animate-fadeIn pb-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><History size={20} /></div>
                <h2 className="text-2xl font-bold text-slate-900">Journal complet</h2>
              </div>
              <button onClick={handleBack} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm"><ArrowLeft size={16} /> Retour</button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setHistoryView('transactions')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${historyView === 'transactions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Recharges
              </button>
              <button 
                onClick={() => setHistoryView('consumption')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${historyView === 'consumption' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Consommation
              </button>
            </div>

            {historyView === 'transactions' ? (
              <>
                <div className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Opérateur</label>
                    <select 
                      value={historyFilterOperator} 
                      onChange={(e) => setHistoryFilterOperator(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="all">Tous les opérateurs</option>
                      {Object.values(Operator).map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Statut</label>
                    <select 
                      value={historyFilterStatus} 
                      onChange={(e) => setHistoryFilterStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="success">Réussi</option>
                      <option value="pending">En attente</option>
                      <option value="failed">Échoué</option>
                    </select>
                  </div>
                </div>

                {filteredTransactions.length > 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                    {filteredTransactions.map((tx) => (
                      <div key={tx.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${tx.isWalletTopUp ? 'bg-green-50 text-green-600 border-green-100' : tx.id.startsWith('AUTO') ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {tx.isWalletTopUp ? <div className="font-bold">$</div> : tx.id.startsWith('AUTO') ? <RefreshCcw size={24} /> : <OperatorIcon operator={tx.operator} size={32} />}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-slate-900">{tx.isWalletTopUp ? 'Recharge Portefeuille' : tx.meterNumber}</p>
                            <p className="text-[10px] font-medium text-slate-500 tracking-widest">{new Date(tx.date).toLocaleString()} via {tx.operator}</p>
                            {!tx.isWalletTopUp && <div className="mt-2 inline-flex px-3 py-1 bg-slate-50 text-green-600 border border-slate-200 rounded-lg font-mono text-xs tracking-widest">{tx.token}</div>}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${tx.status === 'success' ? 'bg-green-50 text-green-600 border-green-200' : tx.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                              {tx.status === 'success' ? 'Réussi' : tx.status === 'pending' ? 'En attente' : 'Échoué'}
                            </span>
                            <p className={`text-xl font-bold ${tx.isWalletTopUp ? 'text-green-600' : 'text-slate-900'}`}>
                              {tx.isWalletTopUp ? '+' : ''}{tx.amount.toLocaleString()} <span className="text-xs text-slate-500 font-medium">FCFA</span>
                            </p>
                          </div>
                          {!tx.isWalletTopUp && <button onClick={() => handleStartRecharge(tx)} className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-700 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100">Répéter <RefreshCcw size={10} /></button>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200">
                      <Filter size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-bold text-lg">Aucune transaction trouvée</p>
                    <p className="text-slate-500 text-sm mt-2">Modifiez vos filtres pour voir plus de résultats.</p>
                  </div>
                )}
              </>
            ) : (
              <ConsumptionHistory history={consumptionHistory} stats={consumptionStats} />
            )}
          </div>
        );
      }
      case 'help':
        return <GeminiSupport onBack={handleBack} />;
      case 'profile':
        return <Profile user={user} onLogout={handleLogout} onUpdateUser={setUser} onBack={() => handleNavigate('home')} onTopUp={handleWalletTopUp} onNavigate={(tab) => handleNavigate(tab)} />;
      case 'database':
        return <DatabaseViewer onBack={handleBack} />;
      case 'admin':
        return <AdminDashboard onBack={handleBack} />;
      default: return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleNavigate} isGridActive={isGridSyncing}>
      {renderContent()}
      
      {apiError.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-[200] flex items-center gap-3 animate-slide-down max-w-md w-[90%] md:w-auto">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="font-bold text-lg">!</span>
          </div>
          <p className="text-sm font-medium">{apiError.message}</p>
        </div>
      )}

      {showAutoToast && (
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl animate-scaleUp z-[100] border border-slate-700 flex items-center gap-4 max-w-sm">
          <div className={`w-12 h-12 ${toastMessage.icon === 'calendar' ? 'bg-purple-500' : 'bg-blue-500'} text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg`}>
            {toastMessage.icon === 'calendar' ? <Calendar size={24} /> : <RefreshCcw className="animate-spin-slow" size={24} />}
          </div>
          <div><p className="font-bold text-sm">{toastMessage.title}</p><p className="text-xs text-slate-400">{toastMessage.sub}</p></div>
        </div>
      )}
    </Layout>
  );
};

export default App;

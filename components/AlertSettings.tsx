
import React, { useState, useEffect } from 'react';
import { Bell, ToggleLeft, ToggleRight, Save, ShieldAlert, RefreshCcw, Calendar, Clock, Plus, Trash2, CalendarCheck, Play, Zap, CheckCircle2, XCircle, History, ArrowLeft, Info, Eraser, Volume2, Vibrate, VolumeX, Music, Waves, Sparkles, Bot, MessageSquare, Loader2, CalendarPlus, CreditCard, Smartphone } from 'lucide-react';
import { AlertSettings as AlertSettingsType, AutoRechargeSettings, Operator, ScheduledRecharge } from '../types';
import { getAISupport } from '../services/gemini';

interface AlertSettingsProps {
  settings: AlertSettingsType;
  autoSettings: AutoRechargeSettings;
  scheduledRecharges: ScheduledRecharge[];
  onUpdateAlerts: (settings: AlertSettingsType) => void;
  onUpdateAuto: (settings: AutoRechargeSettings) => void;
  onAddScheduled: (recharge: ScheduledRecharge) => void;
  onRemoveScheduled: (id: string) => void;
  onSimulateScheduled: (recharge: ScheduledRecharge) => void;
  onClearHistory: () => void;
  onBack: () => void;
}

export const AlertSettings: React.FC<AlertSettingsProps> = ({ 
  settings, 
  autoSettings, 
  scheduledRecharges,
  onUpdateAlerts, 
  onUpdateAuto,
  onAddScheduled,
  onRemoveScheduled,
  onSimulateScheduled,
  onClearHistory,
  onBack
}) => {
  // États locaux pour le mode "brouillon"
  const [localAlerts, setLocalAlerts] = useState<AlertSettingsType>(settings || { 
    enabled: false, 
    threshold: 10, 
    lastNotified: null,
    volume: 50 
  });
  const [localAuto, setLocalAuto] = useState<AutoRechargeSettings>(autoSettings || { 
    enabled: false, 
    triggerThreshold: 15, 
    amount: 5000, 
    operator: Operator.ORANGE,
    volume: 50 
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Détecter les changements par rapport aux props initiales
  useEffect(() => {
    const alertsChanged = JSON.stringify(localAlerts) !== JSON.stringify(settings);
    const autoChanged = JSON.stringify(localAuto) !== JSON.stringify(autoSettings);
    setHasChanges(alertsChanged || autoChanged);
  }, [localAlerts, localAuto, settings, autoSettings]);

  const handleSaveAll = () => {
    setIsSaving(true);
    // Simulation d'appel à la base de données
    setTimeout(() => {
      onUpdateAlerts(localAlerts);
      onUpdateAuto(localAuto);
      setIsSaving(false);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const getSmartAdvice = async (topic?: string) => {
    setIsAiLoading(true);
    setShowAiPanel(true);
    
    const context = `
      L'utilisateur a les paramètres suivants :
      - Seuil d'alerte : ${localAlerts.threshold} kWh (Statut: ${localAlerts.enabled ? 'Activé' : 'Désactivé'})
      - Auto-recharge : ${localAuto.amount} FCFA dès ${localAuto.triggerThreshold} kWh (Statut: ${localAuto.enabled ? 'Activé' : 'Désactivé'})
      
      Donne un conseil court, expert et bienveillant en tant qu'assistant ElectraPay.
    `;

    const response = await getAISupport(context);
    setAiAdvice(response);
    setIsAiLoading(false);
  };

  const playTestSound = (isAlert: boolean = true) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const volume = (isAlert ? localAlerts.volume : localAuto.volume) || 50;
      const type = isAlert ? (localAlerts.soundType || 'beep') : 'wave';

      gainNode.gain.setValueAtTime(volume / 500, audioCtx.currentTime);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(isAlert ? 660 : 880, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.6);
    } catch (e) { console.error(e); }
  };

  const testVibration = (pattern: 'short' | 'long' | 'urgent' = 'short') => {
    if ('vibrate' in navigator) {
      const p = pattern === 'urgent' ? [200, 100, 200, 100, 200] : pattern === 'long' ? 500 : 100;
      navigator.vibrate(p);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-32">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-2xl font-black text-slate-800">Paramètres Grid</h1>
        <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-sm">
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      {/* Assistant AI Advisor */}
      <div className={`overflow-hidden transition-all duration-500 bg-gradient-to-br from-indigo-600 to-slate-900 rounded-[2.5rem] shadow-xl ${showAiPanel ? 'p-8' : 'p-6'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative">
              <Bot className="text-white" size={24} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <Sparkles size={8} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Conseiller Intelligent</h2>
              <p className="text-xs text-indigo-200 font-medium">Analyse Grid en temps réel active</p>
            </div>
          </div>
          {!showAiPanel ? (
            <button onClick={() => getSmartAdvice()} className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
              Demander conseil
            </button>
          ) : (
            <button onClick={() => setShowAiPanel(false)} className="text-white/40 hover:text-white transition-colors">
              <XCircle size={20} />
            </button>
          )}
        </div>
        {showAiPanel && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-indigo-50 min-h-[100px] flex items-center justify-center">
              {isAiLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-orange-400" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Analyse...</p>
                </div>
              ) : (
                <p className="text-sm leading-relaxed font-medium">{aiAdvice}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section Auto-Recharge */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center"><RefreshCcw className="text-blue-600" size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Auto-recharge intelligente</h2>
            <p className="text-sm text-slate-500">Paiement autonome sécurisé.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <div><p className="font-bold text-slate-800">Paiement Automatique</p><p className="text-xs text-slate-500">Gestion autonome des unités.</p></div>
            <button onClick={() => setLocalAuto({...localAuto, enabled: !localAuto.enabled})} className="transition-transform active:scale-90">
              {localAuto.enabled ? <ToggleRight size={48} className="text-blue-500" /> : <ToggleLeft size={48} className="text-slate-300" />}
            </button>
          </div>

          <div className={`space-y-8 ${localAuto.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Seuil auto-pay</span>
                    <span className="text-sm font-black text-blue-600">{localAuto.triggerThreshold} kWh</span>
                  </div>
                  <input type="range" min="5" max="100" value={localAuto.triggerThreshold} onChange={(e) => setLocalAuto({...localAuto, triggerThreshold: parseInt(e.target.value)})} className="w-full h-1.5 bg-blue-100 rounded-lg accent-blue-600" />
                </label>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-black text-slate-500 block mb-2 uppercase tracking-widest">Montant de recharge</span>
                  <div className="relative">
                    <input type="number" value={localAuto.amount} onChange={(e) => setLocalAuto({...localAuto, amount: parseInt(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-lg" />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">FCFA</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Alertes */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center"><Bell className="text-orange-600" size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Alertes Seuil Bas</h2>
            <p className="text-sm text-slate-500">Signal d'urgence d'énergie.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div><p className="font-bold text-slate-800">Signal sonore/vibreur</p><p className="text-xs text-slate-500">Notifications actives.</p></div>
            <button onClick={() => setLocalAlerts({...localAlerts, enabled: !localAlerts.enabled})} className="transition-transform active:scale-90">
              {localAlerts.enabled ? <ToggleRight size={48} className="text-orange-500" /> : <ToggleLeft size={48} className="text-slate-300" />}
            </button>
          </div>

          <div className={`space-y-8 ${localAlerts.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <label className="block">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Niveau critique</span>
                <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${localAlerts.threshold === 10 ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-50 text-orange-600'}`}>
                  {localAlerts.threshold} kWh {localAlerts.threshold === 10 && '• RECOMMANDÉ'}
                </span>
              </div>
              <input type="range" min="0.5" max="50" step="0.5" value={localAlerts.threshold} onChange={(e) => setLocalAlerts({...localAlerts, threshold: parseFloat(e.target.value)})} className="w-full h-1.5 bg-orange-100 rounded-lg accent-orange-500" />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 font-bold text-sm text-slate-700"><Volume2 size={18} /> Sonnerie</div>
                   <button onClick={() => setLocalAlerts({...localAlerts, soundEnabled: !localAlerts.soundEnabled})} className={`w-10 h-6 rounded-full relative transition-colors ${localAlerts.soundEnabled ? 'bg-orange-500' : 'bg-slate-300'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all`} style={{ left: localAlerts.soundEnabled ? '1.25rem' : '0.25rem' }} />
                   </button>
                </div>
                {localAlerts.soundEnabled && (
                  <div className="space-y-4 animate-fadeIn">
                    <input type="range" min="0" max="100" value={localAlerts.volume || 50} onChange={(e) => setLocalAlerts({...localAlerts, volume: parseInt(e.target.value)})} className="w-full h-1.5 bg-orange-200 accent-orange-500 rounded-lg appearance-none cursor-pointer" />
                    <button onClick={() => playTestSound(true)} className="w-full py-2 bg-white border border-orange-200 rounded-xl text-[10px] font-black text-orange-600 uppercase flex items-center justify-center gap-2 hover:bg-orange-100 transition-all shadow-sm">Tester le son</button>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 font-bold text-sm text-slate-700"><Waves size={18} /> Vibration</div>
                   <button onClick={() => setLocalAlerts({...localAlerts, vibrateEnabled: !localAlerts.vibrateEnabled})} className={`w-10 h-6 rounded-full relative transition-colors ${localAlerts.vibrateEnabled ? 'bg-orange-500' : 'bg-slate-300'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all`} style={{ left: localAlerts.vibrateEnabled ? '1.25rem' : '0.25rem' }} />
                   </button>
                </div>
                {localAlerts.vibrateEnabled && (
                   <button onClick={() => testVibration()} className="w-full py-2 bg-white border border-orange-200 rounded-xl text-[10px] font-black text-orange-600 uppercase flex items-center justify-center gap-2 hover:bg-orange-100 transition-all shadow-sm">Tester vibreur</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Rappels de Consommation */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center"><CalendarCheck className="text-purple-600" size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Rappels de Consommation</h2>
            <p className="text-sm text-slate-500">Suivi régulier de votre énergie.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div><p className="font-bold text-slate-800">Activer les rappels</p><p className="text-xs text-slate-500">Recevez des bilans périodiques.</p></div>
            <button 
              onClick={() => setLocalAlerts({
                ...localAlerts, 
                reminders: {
                  ...localAlerts.reminders,
                  enabled: !(localAlerts.reminders?.enabled ?? false),
                  frequency: localAlerts.reminders?.frequency || 'weekly',
                  channels: localAlerts.reminders?.channels || { sms: true, push: true }
                }
              })} 
              className="transition-transform active:scale-90"
            >
              {localAlerts.reminders?.enabled ? <ToggleRight size={48} className="text-purple-500" /> : <ToggleLeft size={48} className="text-slate-300" />}
            </button>
          </div>

          <div className={`space-y-8 ${localAlerts.reminders?.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Fréquence</label>
              <div className="grid grid-cols-3 gap-2">
                {['daily', 'weekly', 'monthly'].map(freq => (
                  <button
                    key={freq}
                    onClick={() => setLocalAlerts({
                      ...localAlerts,
                      reminders: { ...localAlerts.reminders!, frequency: freq as any }
                    })}
                    className={`p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all ${localAlerts.reminders?.frequency === freq ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                  >
                    {freq === 'daily' ? 'Quotidien' : freq === 'weekly' ? 'Hebdo' : 'Mensuel'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Canaux de réception</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setLocalAlerts({
                    ...localAlerts,
                    reminders: { 
                      ...localAlerts.reminders!, 
                      channels: { ...localAlerts.reminders!.channels, sms: !localAlerts.reminders!.channels.sms } 
                    }
                  })}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${localAlerts.reminders?.channels?.sms ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${localAlerts.reminders?.channels?.sms ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-300'}`}>
                    {localAlerts.reminders?.channels?.sms && <CheckCircle2 size={14} />}
                  </div>
                  <span className="font-bold text-sm">SMS</span>
                </div>
                
                <div 
                  onClick={() => setLocalAlerts({
                    ...localAlerts,
                    reminders: { 
                      ...localAlerts.reminders!, 
                      channels: { ...localAlerts.reminders!.channels, push: !localAlerts.reminders!.channels.push } 
                    }
                  })}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${localAlerts.reminders?.channels?.push ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${localAlerts.reminders?.channels?.push ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-300'}`}>
                    {localAlerts.reminders?.channels?.push && <CheckCircle2 size={14} />}
                  </div>
                  <span className="font-bold text-sm">Push</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de Validation / Enregistrement */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 transition-all duration-500 ${hasChanges || isSaving || saveSuccess ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className={`w-full py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${saveSuccess ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'}`}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Enregistrement dans la base...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 size={20} />
              Modifications enregistrées !
            </>
          ) : (
            <>
              <Save size={20} />
              Valider et Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
};

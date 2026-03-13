
import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Mail, MessageSquare, ArrowLeft, Save, Loader2, CheckCircle2, ShieldCheck, ToggleLeft, ToggleRight, Zap, Info, Bot, Sparkles } from 'lucide-react';
import { NotificationPreferences as NotificationPrefsType } from '../types';

interface NotificationPreferencesProps {
  preferences: NotificationPrefsType;
  onUpdate: (prefs: NotificationPrefsType) => void;
  onBack: () => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ preferences, onUpdate, onBack }) => {
  const [localPrefs, setLocalPrefs] = useState<NotificationPrefsType>(preferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setHasChanges(JSON.stringify(localPrefs) !== JSON.stringify(preferences));
  }, [localPrefs, preferences]);

  const handleSave = () => {
    setIsSaving(true);
    // Simuler un appel API / Base de données
    setTimeout(() => {
      onUpdate(localPrefs);
      setIsSaving(false);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const toggleChannel = (channel: keyof typeof localPrefs.channels) => {
    setLocalPrefs({
      ...localPrefs,
      channels: { ...localPrefs.channels, [channel]: !localPrefs.channels[channel] }
    });
  };

  const toggleCategory = (category: keyof typeof localPrefs.categories) => {
    setLocalPrefs({
      ...localPrefs,
      categories: { ...localPrefs.categories, [category]: !localPrefs.categories[category] }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-32">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-2xl font-black text-slate-800">Notifications</h1>
        <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-sm">
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Bell size={120} />
        </div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl font-black">Restez informé</h2>
          <p className="text-indigo-100 text-sm max-w-xs font-medium leading-relaxed">
            Choisissez comment et quand vous souhaitez recevoir les mises à jour de votre consommation CIE.
          </p>
        </div>
      </div>

      {/* Canaux de communication */}
      <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Smartphone size={14} /> Canaux de réception
        </h3>
        
        <div className="space-y-4">
          <NotificationToggle 
            icon={<MessageSquare className="text-blue-500" />} 
            label="SMS" 
            desc="Alertes critiques par message texte" 
            enabled={localPrefs.channels.sms} 
            onToggle={() => toggleChannel('sms')} 
          />
          <NotificationToggle 
            icon={<Bell className="text-orange-500" />} 
            label="Push Mobile" 
            desc="Notifications instantanées sur l'app" 
            enabled={localPrefs.channels.push} 
            onToggle={() => toggleChannel('push')} 
          />
          <NotificationToggle 
            icon={<Mail className="text-purple-500" />} 
            label="Email" 
            desc="Recus et rapports mensuels" 
            enabled={localPrefs.channels.email} 
            onToggle={() => toggleChannel('email')} 
          />
        </div>
      </section>

      {/* Catégories de notifications */}
      <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck size={14} /> Contenu des messages
        </h3>
        
        <div className="space-y-4">
          <NotificationToggle 
            icon={<Zap className="text-yellow-500" />} 
            label="Transactions" 
            desc="Confirmation d'achat de crédit" 
            enabled={localPrefs.categories.transactions} 
            onToggle={() => toggleCategory('transactions')} 
          />
          <NotificationToggle 
            icon={<Info className="text-red-500" />} 
            label="Alertes Énergie" 
            desc="Rappels de seuil bas et urgences" 
            enabled={localPrefs.categories.alerts} 
            onToggle={() => toggleCategory('alerts')} 
          />
          <NotificationToggle 
            icon={<Bot className="text-indigo-500" />} 
            label="Conseils AI" 
            desc="Astuces d'économie personnalisées" 
            enabled={localPrefs.categories.tips} 
            onToggle={() => toggleCategory('tips')} 
          />
        </div>
      </section>

      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex items-start gap-4">
        <Sparkles className="text-orange-500 shrink-0 mt-1" size={20} />
        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
          <strong>Note :</strong> Les alertes de sécurité système ne peuvent pas être désactivées pour garantir la protection de votre compte et la synchronisation continue avec le réseau CIE.
        </p>
      </div>

      {/* Floating Save Button */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 transition-all duration-500 ${hasChanges || isSaving || saveSuccess ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${saveSuccess ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'}`}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Mise à jour de la base...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 size={20} />
              Préférences enregistrées !
            </>
          ) : (
            <>
              <Save size={20} />
              Valider les préférences
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const NotificationToggle = ({ icon, label, desc, enabled, onToggle }: { icon: any, label: string, desc: string, enabled: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 leading-none mb-1">{label}</p>
        <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
      </div>
    </div>
    <button onClick={onToggle} className="transition-transform active:scale-90">
      {enabled ? <ToggleRight size={44} className="text-slate-900" /> : <ToggleLeft size={44} className="text-slate-200" />}
    </button>
  </div>
);

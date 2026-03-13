
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, Key, Smartphone, Share2, Trash2, ArrowLeft, Save, Loader2, CheckCircle2, ShieldAlert, ToggleLeft, ToggleRight, LogOut, Info, Lock, Monitor, MapPin, X, AlertTriangle } from 'lucide-react';
import { SecuritySettings as SecuritySettingsType, Session } from '../types';

interface SecuritySettingsProps {
  settings: SecuritySettingsType;
  onUpdate: (settings: SecuritySettingsType) => void;
  onBack: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ settings, onUpdate, onBack }) => {
  const [localSettings, setLocalSettings] = useState<SecuritySettingsType>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Gestion des sessions
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', device: 'iPhone 15 Pro', browser: 'Safari Mobile', location: 'Abidjan, CI', lastActive: 'En ligne', isCurrent: true },
    { id: '2', device: 'MacBook Air M2', browser: 'Chrome', location: 'Yamoussoukro, CI', lastActive: 'Il y a 2 heures', isCurrent: false },
    { id: '3', device: 'Samsung Galaxy S23', browser: 'Electra App v2', location: 'Bouaké, CI', lastActive: 'Hier à 14:20', isCurrent: false },
  ]);

  useEffect(() => {
    setHasChanges(JSON.stringify(localSettings) !== JSON.stringify(settings));
  }, [localSettings, settings]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(localSettings);
      setIsSaving(false);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const toggleOption = (option: keyof SecuritySettingsType) => {
    setLocalSettings({ ...localSettings, [option]: !localSettings[option] });
  };

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const revokeAllOthers = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
  };

  if (showSessions) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-32">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><Monitor size={20} /></div>
             <h1 className="text-xl font-bold text-slate-900">Sessions Actives</h1>
          </div>
          <button onClick={() => setShowSessions(false)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <ArrowLeft size={16} /> Retour
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-2 shadow-sm">
          <div className="divide-y divide-slate-100">
            {sessions.map(session => (
              <div key={session.id} className="p-6 flex items-center justify-between group transition-all hover:bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${session.isCurrent ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {session.device.includes('iPhone') || session.device.includes('Samsung') ? <Smartphone size={24} /> : <Monitor size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{session.device}</p>
                      {session.isCurrent && (
                        <span className="text-[8px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest">Cet appareil</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest">{session.browser} • {session.lastActive}</p>
                    <div className="flex items-center gap-1 mt-1">
                       <MapPin size={10} className="text-slate-400" />
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{session.location}</span>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button 
                    onClick={() => revokeSession(session.id)}
                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                    title="Déconnecter cet appareil"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {sessions.length > 1 && (
          <button 
            onClick={revokeAllOthers}
            className="w-full py-4 border border-dashed border-red-200 text-red-600 rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldAlert size={16} /> Déconnecter tous les autres appareils
          </button>
        )}

        <div className="p-6 bg-orange-50 rounded-3xl flex items-start gap-4 border border-orange-100">
           <AlertTriangle size={20} className="text-orange-500 shrink-0" />
           <p className="text-[11px] font-bold text-orange-700 leading-relaxed uppercase tracking-widest">
             Si vous voyez un appareil que vous ne reconnaissez pas, nous vous recommandons de révoquer sa session immédiatement et de changer votre mot de passe.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-32">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-2xl font-bold text-slate-900">Sécurité</h1>
        <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      {/* Hero Security Card */}
      <div className="bg-white rounded-[2.5rem] p-8 text-slate-900 shadow-md border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={120} className="text-blue-600" />
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
            <Lock className="text-blue-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Protection Grid</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Votre compte est protégé par un cryptage de niveau bancaire.
            </p>
          </div>
        </div>
      </div>

      {/* Authentification */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Key size={14} /> Accès au compte
        </h3>
        
        <div className="space-y-4">
          <SecurityToggle 
            icon={<Fingerprint className="text-blue-600" />} 
            label="Verrouillage Biométrique" 
            desc="Utiliser Face ID ou Empreinte digitale" 
            enabled={localSettings.biometricLock} 
            onToggle={() => toggleOption('biometricLock')} 
          />
          <NotificationToggle 
            icon={<Smartphone className="text-orange-500" />} 
            label="Double Authentification (2FA)" 
            desc="Code SMS requis pour les recharges > 10.000F" 
            enabled={localSettings.twoFactorAuth} 
            onToggle={() => toggleOption('twoFactorAuth')} 
          />
        </div>
      </section>

      {/* Confidentialité */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Share2 size={14} /> Vie Privée
        </h3>
        
        <div className="space-y-4">
          <SecurityToggle 
            icon={<Share2 className="text-green-600" />} 
            label="Partage de données IA" 
            desc="Aider ElectraPay à améliorer les conseils" 
            enabled={localSettings.dataSharing} 
            onToggle={() => toggleOption('dataSharing')} 
          />
        </div>
      </section>

      {/* Actions de Compte */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert size={14} /> Zone de danger
        </h3>
        
        <div className="space-y-3">
          <button 
            onClick={() => setShowSessions(true)}
            className="w-full p-4 flex items-center justify-between bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-slate-500 group-hover:text-slate-700 transition-colors" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Déconnecter les autres sessions</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">Gérer</span>
          </button>
          
          <button className="w-full p-4 flex items-center justify-between bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors group">
            <div className="flex items-center gap-3">
              <Trash2 size={18} className="text-red-600" />
              <span className="text-sm font-medium text-red-600">Supprimer mon compte</span>
            </div>
          </button>
        </div>
      </section>

      <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex items-start gap-4">
        <Info className="text-blue-600 shrink-0 mt-1" size={20} />
        <p className="text-[11px] font-bold text-blue-800 leading-relaxed uppercase tracking-widest">
          Toutes vos transactions sont sécurisées par le protocole SSL. ElectraPay ne stocke jamais vos codes de paiement mobiles secrets.
        </p>
      </div>

      {/* Floating Save Button */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 transition-all duration-500 ${hasChanges || isSaving || saveSuccess ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-4 rounded-2xl font-medium text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${saveSuccess ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'}`}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Mise à jour du coffre-fort...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 size={20} />
              Sécurité mise à jour !
            </>
          ) : (
            <>
              <Save size={20} />
              Valider les paramètres
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const SecurityToggle = ({ icon, label, desc, enabled, onToggle }: { icon: any, label: string, desc: string, enabled: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4 text-left">
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900 leading-none mb-1">{label}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{desc}</p>
      </div>
    </div>
    <button onClick={onToggle} className="transition-transform active:scale-90">
      {enabled ? <ToggleRight size={44} className="text-green-500" /> : <ToggleLeft size={44} className="text-slate-300" />}
    </button>
  </div>
);

const NotificationToggle = ({ icon, label, desc, enabled, onToggle }: { icon: any, label: string, desc: string, enabled: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4 text-left">
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900 leading-none mb-1">{label}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{desc}</p>
      </div>
    </div>
    <button onClick={onToggle} className="transition-transform active:scale-90">
      {enabled ? <ToggleRight size={44} className="text-green-500" /> : <ToggleLeft size={44} className="text-slate-300" />}
    </button>
  </div>
);

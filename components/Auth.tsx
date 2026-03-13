
import React, { useState } from 'react';
import { User as UserIcon, Smartphone, Cpu, ArrowRight, CheckCircle2, ShieldCheck, Zap, Loader2, KeyRound } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthProps {
  onRegister: (user: User & { password?: string }) => void;
  onLogin: (phone: string, password?: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onRegister, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    meter: '',
    otp: '',
    termsAccepted: false
  });

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(prev => prev + 1);
    }, 1200);
  };

  const formatMeterNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    const parts = [];
    if (raw.length > 0) parts.push(raw.slice(0, 4));
    if (raw.length > 4) parts.push(raw.slice(4, 7));
    if (raw.length > 7) parts.push(raw.slice(7, 11));
    return parts.join(' ');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await onLogin(formData.phone, formData.password);
      } else if (mode === 'register') {
        if (step === 1) {
          handleNext();
          return;
        }
      } else if (mode === 'reset') {
        await api.resetPassword(formData.phone, formData.password);
        setSuccessMsg('Mot de passe réinitialisé avec succès. Veuillez vous connecter.');
        setMode('login');
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishRegister = () => {
    setIsLoading(true);
    setTimeout(() => {
      const meterNumber = formData.meter ? formatMeterNumber(formData.meter) : '0142 3456 789';
      const newUser: User & { password?: string } = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        defaultMeter: meterNumber,
        meters: [{ number: meterNumber, alias: 'Compteur Principal', isDefault: true }],
        walletBalance: 0,
        createdAt: new Date().toISOString()
      };
      onRegister(newUser);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-green-500/10 blur-[120px] rounded-full" />

      <div className="max-w-md w-full space-y-8 relative z-10 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-green-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-green-600/20 mb-6">
            <Zap size={40} className="text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">ElectraPay CIE</h1>
          <p className="text-slate-500 font-medium">L'énergie intelligente au bout des doigts.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 border border-green-200 rounded-xl text-sm font-medium">
              {successMsg}
            </div>
          )}

          {mode === 'login' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Connexion</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Accédez à votre espace client</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">N° de Téléphone</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      placeholder="07 00 00 00 00"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:border-green-500 focus:bg-white outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mot de passe</label>
                    <button onClick={() => setMode('reset')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700">Oublié ?</button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:border-green-500 focus:bg-white outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <button 
                disabled={!formData.phone || !formData.password || isLoading}
                onClick={handleSubmit}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-medium shadow-md shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Se connecter <ArrowRight size={20} /></>}
              </button>

              <p className="text-center text-sm text-slate-600 font-medium">
                Nouveau ? <button onClick={() => { setMode('register'); setStep(1); }} className="text-green-600 font-bold hover:underline">Créer un compte</button>
              </p>
            </div>
          )}

          {mode === 'reset' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Réinitialisation</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nouveau mot de passe</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">N° de Téléphone</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      placeholder="07 00 00 00 00"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:border-green-500 focus:bg-white outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:border-green-500 focus:bg-white outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <button 
                disabled={!formData.phone || !formData.password || isLoading}
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-medium shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Réinitialiser <CheckCircle2 size={20} /></>}
              </button>

              <p className="text-center text-sm text-slate-600 font-medium">
                <button onClick={() => setMode('login')} className="text-slate-500 font-bold hover:underline">Retour à la connexion</button>
              </p>
            </div>
          )}

          {mode === 'register' && step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Bienvenue !</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Création de votre compte client</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nom complet</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Ex: Patrick Koffi"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:border-green-500 focus:bg-white outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">N° de Téléphone</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      placeholder="07 00 00 00 00"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:border-green-500 focus:bg-white outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:border-green-500 focus:bg-white outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <input 
                    type="checkbox" 
                    id="terms"
                    checked={formData.termsAccepted}
                    onChange={e => setFormData({...formData, termsAccepted: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
                    J'ai lu et je suis d'accord pour toutes les conditions.
                  </label>
                </div>
              </div>

              <button 
                disabled={!formData.name || !formData.phone || !formData.password || !formData.termsAccepted || isLoading}
                onClick={handleSubmit}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-medium shadow-md shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Continuer <ArrowRight size={20} /></>}
              </button>

              <p className="text-center text-sm text-slate-600 font-medium">
                Déjà un compte ? <button onClick={() => setMode('login')} className="text-green-600 font-bold hover:underline">Se connecter</button>
              </p>
            </div>
          )}

          {mode === 'register' && step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Liaison Compteur</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Synchronisation CIE automatique</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">La liaison intelligente permet de recharger votre compteur à distance sans jamais saisir de code.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">N° de Compteur (11 chiffres)</label>
                <div className="relative">
                  <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="0000 000 0000"
                    value={formData.meter}
                    onChange={e => setFormData({...formData, meter: formatMeterNumber(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono tracking-widest placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <button 
                disabled={formData.meter.replace(/\s/g, '').length < 11 || isLoading}
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-medium shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Vérifier le compteur <ArrowRight size={20} /></>}
              </button>

              <button onClick={() => setStep(3)} className="w-full text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-slate-700 transition-colors">Passer cette étape</button>
            </div>
          )}

          {mode === 'register' && step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Vérification SMS</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Un code a été envoyé au {formData.phone}</p>
              </div>

              <div className="flex justify-between gap-2">
                {[1,2,3,4].map(i => (
                  <input 
                    key={i}
                    type="text" 
                    maxLength={1}
                    className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-mono focus:border-green-500 focus:bg-white outline-none text-slate-900"
                  />
                ))}
              </div>

              <button 
                onClick={handleFinishRegister}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-medium shadow-md shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Valider mon compte <CheckCircle2 size={20} /></>}
              </button>
              
              <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">Renvoyer le code dans 59s</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


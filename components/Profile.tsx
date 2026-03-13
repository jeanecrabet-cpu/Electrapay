
import React, { useState } from 'react';
import { User as UserIcon, LogOut, Smartphone, Cpu, ShieldCheck, ArrowLeft, Camera, Settings, Bell, CreditCard, ChevronRight, Wallet, Plus, Loader2, Database, History, HelpCircle } from 'lucide-react';
import { User, Operator } from '../types';
import { OperatorIcon } from './OperatorIcon';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onTopUp: (amount: number, op: Operator) => void;
  onNavigate: (tab: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateUser, onBack, onTopUp, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('5000');
  const [selectedOp, setSelectedOp] = useState<Operator>(Operator.ORANGE);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = () => {
    onUpdateUser({ ...user, name });
    setIsEditing(false);
  };

  const handleTopUpConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onTopUp(parseInt(topUpAmount), selectedOp);
      setIsProcessing(false);
      setShowTopUp(false);
    }, 2000);
  };

  const defaultMeter = user.meters?.find(m => m.isDefault) || { number: user.defaultMeter, alias: 'Principal' };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-24">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-2xl font-bold text-slate-900">Mon Compte</h1>
        <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      {/* Wallet Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-slate-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
          <Wallet size={120} className="text-green-600" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <Wallet className="text-green-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Solde Portefeuille</h2>
          </div>
          <p className="text-5xl font-bold text-slate-900 tracking-tight">
            {user.walletBalance.toLocaleString()} <span className="text-xl font-medium text-slate-500">FCFA</span>
          </p>
          <button 
            onClick={() => setShowTopUp(true)}
            className="px-8 py-4 bg-green-600 text-white rounded-2xl font-medium text-sm shadow-md shadow-green-600/20 active:scale-95 transition-all flex items-center gap-2 hover:bg-green-700"
          >
            <Plus size={20} /> Recharger le solde
          </button>
        </div>
      </div>

      {/* TopUp Modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => !isProcessing && setShowTopUp(false)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
             <div className="p-8 space-y-8">
               <div className="text-center space-y-2">
                 <h3 className="text-2xl font-bold text-slate-900">Créditer Portefeuille</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Choisissez un montant et un mode de paiement.</p>
               </div>

               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                   {['2000', '5000', '10000', '25000'].map(amt => (
                     <button 
                       key={amt} 
                       onClick={() => setTopUpAmount(amt)}
                       className={`py-4 rounded-2xl font-bold border-2 transition-all ${topUpAmount === amt ? 'bg-green-50 border-green-500 text-green-600 shadow-md shadow-green-500/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}
                     >
                       {parseInt(amt).toLocaleString()} F
                     </button>
                   ))}
                 </div>
                 <div className="relative">
                   <input 
                    type="number" 
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-5 px-6 font-bold text-xl outline-none focus:border-green-500 text-center text-slate-900 placeholder:text-slate-400 transition-colors"
                    placeholder="Autre montant..."
                   />
                 </div>
               </div>

               <div className="space-y-4">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Via Opérateur Mobile Money</p>
                 <div className="grid grid-cols-4 gap-2">
                    {[Operator.ORANGE, Operator.MTN, Operator.MOOV, Operator.WAVE].map(op => (
                      <button 
                        key={op} 
                        onClick={() => setSelectedOp(op)}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${selectedOp === op ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}
                      >
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedOp === op ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                           <OperatorIcon operator={op} size={24} />
                         </div>
                      </button>
                    ))}
                 </div>
               </div>

               <button 
                disabled={isProcessing || !topUpAmount}
                onClick={handleTopUpConfirm}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-medium shadow-md shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isProcessing ? <Loader2 className="animate-spin" /> : `Confirmer le dépôt de ${parseInt(topUpAmount).toLocaleString()} F`}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <button className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200">
            <Settings size={20} />
          </button>
        </div>

        <div className="relative inline-block">
          <div className="w-28 h-28 bg-blue-50 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-md">
            <UserIcon size={48} className="text-blue-600" />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-md border-2 border-white active:scale-90 transition-all hover:bg-blue-700">
            <Camera size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {isEditing ? (
            <div className="flex flex-col items-center gap-3">
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="text-2xl font-bold text-slate-900 text-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-colors"
              />
              <button onClick={handleSave} className="text-[10px] font-bold text-green-600 uppercase tracking-widest hover:text-green-700 transition-colors">Enregistrer</button>
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors">Modifier le profil</button>
            </div>
          )}
          <p className="text-[10px] text-slate-500 font-mono tracking-widest">{user.phone}</p>
        </div>
      </div>

      {/* Account Sections */}
      <div className="space-y-4">
        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <ProfileLink 
            icon={<CreditCard size={20} className="text-blue-600" />} 
            label="Gestion des compteurs" 
            value={`${defaultMeter.alias} (${defaultMeter.number})`}
            onClick={() => onNavigate('meters')}
          />
          <ProfileLink 
            icon={<History size={20} className="text-orange-600" />} 
            label="Historique" 
            onClick={() => onNavigate('history')}
          />
          <ProfileLink 
            icon={<Bell size={20} className="text-green-600" />} 
            label="Préférences de notification" 
            onClick={() => onNavigate('notifications')}
          />
          <ProfileLink 
            icon={<ShieldCheck size={20} className="text-indigo-600" />} 
            label="Sécurité et Confidentialité" 
            onClick={() => onNavigate('security')}
          />
          <ProfileLink 
            icon={<HelpCircle size={20} className="text-teal-600" />} 
            label="Aide AI" 
            onClick={() => onNavigate('help')}
          />
          {user.isAdmin && (
            <ProfileLink 
              icon={<Database size={20} className="text-purple-600" />} 
              label="Administration Système" 
              onClick={() => onNavigate('admin')}
            />
          )}
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <button 
            onClick={onLogout}
            className="w-full p-6 flex items-center justify-between hover:bg-red-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-100 transition-colors border border-red-100">
                <LogOut size={20} />
              </div>
              <span className="font-medium text-red-600">Se déconnecter</span>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:text-red-500 transition-colors" />
          </button>
        </section>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membre depuis {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

const ProfileLink = ({ icon, label, value, onClick }: { icon: any, label: string, value?: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group"
  >
    <div className="flex items-center gap-4 text-left">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform border border-slate-200">
        {icon}
      </div>
      <div>
        <p className="font-medium text-slate-700 text-sm leading-none mb-1 group-hover:text-slate-900 transition-colors">{label}</p>
        {value && <p className="text-[10px] text-slate-500 font-mono tracking-widest">{value}</p>}
      </div>
    </div>
    <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 group-hover:text-slate-500 transition-all" />
  </button>
);

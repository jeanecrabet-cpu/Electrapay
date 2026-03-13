
import React, { useState, useEffect, useRef } from 'react';
import { Operator, MeterType, Transaction, MeterEntry } from '../types';
import { CheckCircle2, ChevronRight, CreditCard, Smartphone, Zap, Wifi, Cpu, Loader2, MessageSquare, ShieldCheck, RefreshCw, Check, AlertCircle, Mic, XCircle, ArrowLeft, Delete, ChevronLeft, Info, Wallet } from 'lucide-react';
import { OperatorIcon } from './OperatorIcon';
import { generateRechargeToken } from '../services/gemini';

interface RechargeFormProps {
  walletBalance: number;
  onSuccess: (tx: Transaction) => void;
  onReturnHome: () => void;
  repeatData?: Transaction | null;
  defaultMeter?: string;
  meters?: MeterEntry[];
}

export const RechargeForm: React.FC<RechargeFormProps> = ({ walletBalance, onSuccess, onReturnHome, repeatData, defaultMeter, meters }) => {
  const [step, setStep] = useState(1);
  const [meterNumber, setMeterNumber] = useState(defaultMeter || '');
  const [amount, setAmount] = useState('');
  const [meterType] = useState<MeterType>(MeterType.SMART);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeField, setActiveField] = useState<'meter' | 'amount'>('meter');
  
  const processingTimeoutRef = useRef<any>(null);
  const syncingTimeoutRef = useRef<any>(null);

  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const formatMeterNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    const parts = [];
    if (raw.length > 0) parts.push(raw.slice(0, 4));
    if (raw.length > 4) parts.push(raw.slice(4, 7));
    if (raw.length > 7) parts.push(raw.slice(7, 11));
    return parts.join(' ');
  };

  const handleKeyPress = (num: string) => {
    if ('vibrate' in navigator) navigator.vibrate(20);
    
    if (activeField === 'meter') {
      const raw = meterNumber.replace(/\s/g, '');
      if (raw.length < 11) {
        setMeterNumber(formatMeterNumber(raw + num));
      }
    } else {
      if (amount.length < 7) {
        setAmount(prev => prev + num);
      }
    }
  };

  const handleBackspace = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    if (activeField === 'meter') {
      const raw = meterNumber.replace(/\s/g, '');
      setMeterNumber(formatMeterNumber(raw.slice(0, -1)));
    } else {
      setAmount(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (repeatData) {
      setMeterNumber(repeatData.meterNumber);
      setAmount(repeatData.amount.toString());
      setOperator(repeatData.operator);
      setStep(3);
    }
  }, [repeatData]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const rawMeterNumber = meterNumber.replace(/\s/g, '');
  const isMeterValid = rawMeterNumber.length === 11;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
      setIsSyncing(true);
      syncingTimeoutRef.current = setTimeout(() => completeTransaction(), 3500);
    }, 2000);
  };

  const completeTransaction = () => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      meterNumber: formatMeterNumber(rawMeterNumber),
      amount: parseInt(amount),
      operator: operator!,
      meterType,
      token: generateRechargeToken(),
      date: new Date().toISOString(),
      status: 'success'
    };
    setIsSyncing(false);
    setLastTransaction(newTransaction);
    onSuccess(newTransaction);
    setStep(4);
  };

  const getOpStyles = (op: Operator, isSelected: boolean) => {
    const isDisabled = op === Operator.WALLET && walletBalance < parseInt(amount || '0');
    if (isDisabled) return 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed scale-100 border-2';
    
    const interactiveClasses = isSelected 
      ? 'scale-105 border-2 z-10 ring-4 ring-opacity-20' 
      : 'scale-100 border-2 hover:border-slate-300';

    switch (op) {
      case Operator.WALLET: 
        return isSelected 
          ? `${interactiveClasses} border-green-500 bg-green-50 text-green-600 shadow-lg shadow-green-500/20 ring-green-500` 
          : `${interactiveClasses} border-slate-200 bg-white`;
      case Operator.ORANGE: 
        return isSelected 
          ? `${interactiveClasses} border-orange-500 bg-orange-50 text-orange-600 shadow-lg shadow-orange-500/20 ring-orange-500` 
          : `${interactiveClasses} border-slate-200 bg-white`;
      case Operator.MTN: 
        return isSelected 
          ? `${interactiveClasses} border-yellow-500 bg-yellow-50 text-yellow-600 shadow-lg shadow-yellow-500/20 ring-yellow-500` 
          : `${interactiveClasses} border-slate-200 bg-white`;
      case Operator.MOOV: 
        return isSelected 
          ? `${interactiveClasses} border-blue-500 bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/20 ring-blue-500` 
          : `${interactiveClasses} border-slate-200 bg-white`;
      case Operator.WAVE: 
        return isSelected 
          ? `${interactiveClasses} border-sky-500 bg-sky-50 text-sky-600 shadow-lg shadow-sky-500/20 ring-sky-500` 
          : `${interactiveClasses} border-slate-200 bg-white`;
      default: 
        return 'border-slate-200 bg-white border-2';
    }
  };

  const getIconStyles = (op: Operator, isSelected: boolean) => {
    const scaleClass = isSelected ? 'scale-110' : 'scale-100';
    if (!isSelected) return `bg-slate-100 text-slate-400 ${scaleClass}`;
    
    switch (op) {
      case Operator.WALLET: return `bg-green-600 text-white ${scaleClass}`;
      case Operator.ORANGE: return `bg-orange-50 text-orange-500 ${scaleClass}`;
      case Operator.MTN: return `bg-yellow-50 text-yellow-500 ${scaleClass}`;
      case Operator.MOOV: return `bg-blue-50 text-blue-600 ${scaleClass}`;
      case Operator.WAVE: return `bg-sky-50 text-sky-500 ${scaleClass}`;
      default: return `bg-slate-200 ${scaleClass}`;
    }
  };

  if (isSyncing) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-12 text-center space-y-8 shadow-xl animate-scaleUp border border-slate-200">
        <div className="relative flex justify-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
            <Cpu size={48} className="text-blue-600 animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-32 h-32 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Synchronisation Grid...</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Mise à jour automatique du crédit à distance</p>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-[2.5rem] border border-slate-200 p-8 text-center space-y-6 shadow-md animate-scaleUp">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-green-100"><CheckCircle2 size={48} /></div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Recharge Terminée !</h2>
          <p className="text-sm text-slate-500">Votre compteur intelligent a été crédité instantanément via le réseau CIE.</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Crédit Ajouté</p>
            <p className="text-3xl font-bold text-green-600">+{lastTransaction?.amount.toLocaleString()} FCFA</p>
          </div>
          <div className="flex items-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-100">
            <ShieldCheck size={18} className="shrink-0" /> Paiement {lastTransaction?.operator === Operator.WALLET ? 'prioritaire par portefeuille' : 'Mobile Money'} validé.
          </div>
        </div>

        <button onClick={onReturnHome} className="w-full bg-green-600 text-white py-4 rounded-2xl font-medium shadow-md shadow-green-600/20 active:scale-95 transition-all hover:bg-green-700">Retour au tableau de bord</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-24">
      <div className="flex items-center justify-between px-4">
        <button onClick={onReturnHome} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"><ArrowLeft size={16} /> Annuler</button>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => <div key={s} className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>{s}</div>)}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 md:p-10 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-blue-100">
            <Wifi size={10} className="animate-pulse" /> Mode Intelligent Actif
          </div>
        </div>
        
        {step === 1 && (
          <div className="space-y-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                <Cpu className="text-blue-600" /> Recharge à distance
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uniquement pour les compteurs intelligents CIE</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div 
                  onClick={() => setActiveField('meter')}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${activeField === 'meter' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                >
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">N° de Compteur (11 chiffres)</label>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-mono font-bold tracking-widest ${meterNumber ? 'text-slate-900' : 'text-slate-400'}`}>
                      {meterNumber || "0000 000 0000"}
                    </span>
                    {activeField === 'meter' && <div className="w-1.5 h-8 animate-pulse rounded-full bg-blue-600"></div>}
                  </div>
                </div>

                {meters && meters.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {meters.map(m => (
                      <button
                        key={m.number}
                        onClick={() => {
                          setMeterNumber(m.number);
                          setActiveField('amount');
                        }}
                        className={`shrink-0 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${meterNumber === m.number ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {m.alias}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div 
                onClick={() => setActiveField('amount')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${activeField === 'amount' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
              >
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Montant de recharge (FCFA)</label>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${amount ? 'text-slate-900' : 'text-slate-400'}`}>
                      {amount || "0"}
                    </span>
                    <span className="text-lg font-medium text-slate-500">FCFA</span>
                  </div>
                  {activeField === 'amount' && <div className="w-1.5 h-8 animate-pulse rounded-full bg-blue-600"></div>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-[2rem] border border-slate-200">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "0"].map((key) => (
                <button 
                  key={key} 
                  onClick={() => handleKeyPress(key.toString())}
                  className="h-16 bg-white rounded-2xl flex items-center justify-center text-xl font-bold text-slate-900 shadow-sm hover:bg-slate-50 active:scale-95 transition-all border border-slate-200"
                >
                  {key}
                </button>
              ))}
              <button 
                onClick={handleBackspace}
                className="h-16 bg-white rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all border border-slate-200 shadow-sm"
              >
                <Delete size={24} />
              </button>
              <button 
                disabled={!isMeterValid || !amount || parseInt(amount) < 500}
                onClick={handleNext}
                className="h-16 text-white rounded-2xl flex items-center justify-center font-medium text-xs shadow-md bg-blue-600 shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-95 transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
              <ShieldCheck className="text-blue-600" /> Source de paiement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
               {/* Option Portefeuille ElectraPay */}
               <button 
                disabled={walletBalance < parseInt(amount)}
                onClick={() => setOperator(Operator.WALLET)} 
                className={`p-4 rounded-3xl text-left flex items-center gap-4 transition-all duration-300 relative col-span-1 sm:col-span-2 transform ${getOpStyles(Operator.WALLET, operator === Operator.WALLET)}`}
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${getIconStyles(Operator.WALLET, operator === Operator.WALLET)}`}>
                  <OperatorIcon operator={Operator.WALLET} size={28} />
                </div>
                <div className="flex-1">
                  <span className={`font-bold text-[11px] uppercase tracking-widest block ${operator === Operator.WALLET ? 'opacity-100' : 'text-slate-500'}`}>Portefeuille ElectraPay</span>
                  <span className="text-[10px] font-mono text-slate-500">Solde: {walletBalance.toLocaleString()} F</span>
                </div>
                {walletBalance < parseInt(amount) && <span className="text-[9px] font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full uppercase tracking-widest border border-red-100">Insuffisant</span>}
              </button>

              {[Operator.ORANGE, Operator.MTN, Operator.MOOV, Operator.WAVE].map(op => (
                <button 
                  key={op} 
                  onClick={() => setOperator(op)} 
                  className={`p-4 rounded-3xl text-left flex items-center gap-4 transition-all duration-300 transform ${getOpStyles(op, operator === op)}`}
                >
                  <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${getIconStyles(op, operator === op)}`}>
                    <OperatorIcon operator={op} size={32} className={operator === op ? '' : 'grayscale opacity-60'} />
                  </div>
                  <span className={`font-bold text-[11px] uppercase tracking-widest ${operator === op ? 'opacity-100' : 'text-slate-500'}`}>{op}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={handleBack} className="flex-1 bg-white text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all uppercase text-xs border border-slate-200 shadow-sm">Retour</button>
              <button disabled={!operator} onClick={handleNext} className="flex-[2] text-white py-4 rounded-2xl font-bold shadow-md transition-all uppercase text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-900">Vérification Digitale</h2>
            <div className="rounded-[2rem] p-8 space-y-6 border bg-slate-50 border-slate-200">
              <div className="flex justify-between items-center"><span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Compteur Intelligent</span><span className="font-mono font-bold text-slate-900 text-lg">{meterNumber}</span></div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Montant de recharge</span><span className="font-bold text-2xl text-green-600">{parseInt(amount).toLocaleString()} FCFA</span></div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Mode de Paiement</span>
                <div className="flex items-center gap-2">
                  {operator && <OperatorIcon operator={operator} size={20} />}
                  <span className="font-bold text-slate-900">{operator}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
              <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-widest">
                {operator === Operator.WALLET 
                  ? "Paiement instantané : le montant sera déduit de votre solde ElectraPay."
                  : "Validation requise : confirmez la transaction sur votre téléphone via l'opérateur sélectionné."}
              </p>
            </div>
            <button onClick={handleSubmit} disabled={isProcessing} className="w-full text-white py-4 rounded-2xl font-medium shadow-md active:scale-95 transition-all flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {isProcessing ? <Loader2 className="animate-spin" /> : <>Confirmer la recharge à distance <ChevronRight size={20} /></>}
            </button>
            <button onClick={handleBack} className="w-full text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-slate-700 transition-colors">Modifier les informations</button>
          </div>
        )}
      </div>
    </div>
  );
};

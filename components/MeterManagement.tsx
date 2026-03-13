
import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle2, Save, ArrowLeft, Loader2, Cpu, Tag, Star, StarOff, Info, AlertCircle, Delete } from 'lucide-react';
import { MeterEntry } from '../types';

interface MeterManagementProps {
  meters: MeterEntry[];
  onUpdate: (meters: MeterEntry[]) => void;
  onBack: () => void;
}

export const MeterManagement: React.FC<MeterManagementProps> = ({ meters, onUpdate, onBack }) => {
  const [localMeters, setLocalMeters] = useState<MeterEntry[]>(meters);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeter, setNewMeter] = useState({ number: '', alias: '' });

  useEffect(() => {
    setHasChanges(JSON.stringify(localMeters) !== JSON.stringify(meters));
  }, [localMeters, meters]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(localMeters);
      setIsSaving(false);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const setDefault = (number: string) => {
    setLocalMeters(localMeters.map(m => ({
      ...m,
      isDefault: m.number === number
    })));
  };

  const removeMeter = (number: string) => {
    if (localMeters.length <= 1) return;
    const filtered = localMeters.filter(m => m.number !== number);
    if (localMeters.find(m => m.number === number)?.isDefault) {
      filtered[0].isDefault = true;
    }
    setLocalMeters(filtered);
  };

  const addNewMeter = () => {
    const rawNumber = newMeter.number.replace(/\s/g, '');
    if (rawNumber.length !== 11) return;
    
    const entry: MeterEntry = {
      number: formatMeterNumber(rawNumber),
      alias: newMeter.alias || `Compteur ${localMeters.length + 1}`,
      isDefault: localMeters.length === 0
    };
    
    setLocalMeters([...localMeters, entry]);
    setNewMeter({ number: '', alias: '' });
    setShowAddForm(false);
  };

  const formatMeterNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    const parts = [];
    if (raw.length > 0) parts.push(raw.slice(0, 4));
    if (raw.length > 4) parts.push(raw.slice(4, 7));
    if (raw.length > 7) parts.push(raw.slice(7, 11));
    return parts.join(' ');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-32">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-2xl font-black text-slate-800">Mes Compteurs</h1>
        <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-sm">
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cpu size={120} />
        </div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl font-black">Gestion CIE</h2>
          <p className="text-indigo-100 text-sm max-w-xs font-medium leading-relaxed">
            Ajoutez vos différents compteurs et choisissez celui à utiliser par défaut pour vos recharges.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {localMeters.map((meter) => (
          <div 
            key={meter.number}
            className={`bg-white rounded-[2rem] p-6 border-2 transition-all relative group ${meter.isDefault ? 'border-indigo-500 shadow-lg shadow-indigo-500/5' : 'border-slate-100 shadow-sm'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meter.isDefault ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-800">{meter.alias}</p>
                    {meter.isDefault && (
                      <span className="text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Par défaut</span>
                    )}
                  </div>
                  <p className="text-sm font-mono text-slate-400 tracking-widest">{meter.number}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!meter.isDefault && (
                  <button 
                    onClick={() => setDefault(meter.number)}
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Définir par défaut"
                  >
                    <Star size={20} />
                  </button>
                )}
                <button 
                  onClick={() => removeMeter(meter.number)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
               <Tag size={12} /> Alias du compteur
            </div>
          </div>
        ))}

        <button 
          onClick={() => setShowAddForm(true)}
          className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black text-sm uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all flex flex-col items-center gap-3 bg-slate-50/50"
        >
          <Plus size={32} />
          Ajouter un nouveau compteur
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAddForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Nouveau Compteur</h3>
                <p className="text-sm text-slate-500 font-medium">Liaison intelligente CIE</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Numéro de compteur</label>
                  <input 
                    type="text" 
                    value={newMeter.number}
                    onChange={e => setNewMeter({...newMeter, number: formatMeterNumber(e.target.value)})}
                    placeholder="0000 000 0000"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-black text-xl tracking-widest outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alias (ex: Maison)</label>
                  <input 
                    type="text" 
                    value={newMeter.alias}
                    onChange={e => setNewMeter({...newMeter, alias: e.target.value})}
                    placeholder="Ma Résidence"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Annuler</button>
                <button 
                  disabled={newMeter.number.replace(/\s/g, '').length !== 11}
                  onClick={addNewMeter}
                  className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-30"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Synchronisation Grid...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 size={20} />
              Configuration mise à jour !
            </>
          ) : (
            <>
              <Save size={20} />
              Valider la configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Database, ArrowLeft, RefreshCw, Table as TableIcon } from 'lucide-react';
import { api } from '../services/api';

interface DatabaseViewerProps {
  onBack: () => void;
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({ onBack }) => {
  const [dbState, setDbState] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const fetchDatabase = async () => {
    setLoading(true);
    setError(null);
    try {
      const state = await api.getDatabaseState();
      setDbState(state);
      if (!selectedTable && Object.keys(state).length > 0) {
        setSelectedTable(Object.keys(state)[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  const tables = Object.keys(dbState);
  const currentData = selectedTable ? dbState[selectedTable] : [];
  const columns = currentData.length > 0 ? Object.keys(currentData[0]) : [];

  return (
    <div className="space-y-6 animate-fadeIn pb-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Database size={20} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Base de Données</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchDatabase}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Rafraîchir
          </button>
          <button 
            onClick={onBack} 
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm"
          >
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      {!loading && !error && tables.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
          <p className="text-slate-500 font-medium">La base de données est vide.</p>
        </div>
      )}

      {tables.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3">Tables</h3>
            {tables.map(table => (
              <button
                key={table}
                onClick={() => setSelectedTable(table)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all ${selectedTable === table ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  <TableIcon size={16} className={selectedTable === table ? 'text-purple-500' : 'text-slate-400'} />
                  {table}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedTable === table ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                  {dbState[table].length}
                </span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <TableIcon size={18} className="text-slate-400" />
                  {selectedTable}
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {currentData.length} enregistrement{currentData.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="overflow-auto flex-1 p-0">
                {currentData.length > 0 ? (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        {columns.map(col => (
                          <th key={col} className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          {columns.map(col => {
                            let val = row[col];
                            if (typeof val === 'object' && val !== null) {
                              val = JSON.stringify(val);
                            } else if (typeof val === 'boolean') {
                              val = val ? 'true' : 'false';
                            }
                            return (
                              <td key={col} className="px-4 py-3 text-slate-600 font-mono text-[11px] max-w-xs truncate" title={String(val)}>
                                {String(val)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 font-medium text-sm">
                    Aucune donnée dans cette table
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

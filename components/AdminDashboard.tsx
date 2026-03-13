import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Activity, CreditCard, Calendar, RefreshCw, ShieldAlert, Database } from 'lucide-react';
import { api } from '../services/api';
import { DatabaseViewer } from './DatabaseViewer';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'database'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, txData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminTransactions()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setTransactions(txData);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <Users size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Utilisateurs</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
            <Activity size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats?.totalTransactions || 0}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Transactions</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
            <CreditCard size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats?.totalRevenue?.toLocaleString() || 0} F</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Revenus</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-3">
            <Calendar size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats?.totalScheduled || 0}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Programmées</p>
        </div>
      </div>
    </div>
  );

  const handleToggleAdmin = async (userId: string) => {
    try {
      await api.toggleAdminStatus(userId);
      // Refresh users list
      const usersData = await api.getAdminUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to toggle admin status', error);
      alert('Erreur lors de la modification des droits.');
    }
  };

  const renderUsers = () => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Solde</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Création</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{u.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                <td className="px-6 py-4 text-slate-600">{u.phone}</td>
                <td className="px-6 py-4 font-mono text-slate-900">{u.walletBalance} F</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleAdmin(u.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      u.isAdmin 
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {u.isAdmin ? 'Oui' : 'Non'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Montant</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Opérateur</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{t.userId}</td>
                <td className="px-6 py-4 font-mono text-slate-900">{t.amount} F</td>
                <td className="px-6 py-4 text-slate-600">{t.operator}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{new Date(t.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-24">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <ShieldAlert size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Rafraîchir
          </button>
          <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'transactions' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'database' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Database size={16} /> Base de Données
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-slate-400" size={32} />
        </div>
      ) : (
        <div className="animate-slide-up">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'transactions' && renderTransactions()}
          {activeTab === 'database' && <DatabaseViewer onBack={() => setActiveTab('overview')} />}
        </div>
      )}
    </div>
  );
};

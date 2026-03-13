import { User, Transaction, AlertSettings, AutoRechargeSettings, NotificationPreferences, SecuritySettings, MeterEntry, ScheduledRecharge } from '../types';

const API_BASE = '/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Erreur serveur (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.message) errorMessage = errorData.message;
      else if (errorData.error) errorMessage = errorData.error;
    } catch (e) {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
};

export const api = {
  async register(phone: string, name: string, password?: string, meterNumber?: string): Promise<{ user: User; settings: any }> {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, password, meterNumber }),
      });
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Échec de l'inscription: ${error.message}`);
    }
  },

  async login(phone: string, password?: string): Promise<{ user: User; settings: any }> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Échec de la connexion: ${error.message}`);
    }
  },

  async resetPassword(phone: string, newPassword?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword }),
      });
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Échec de la réinitialisation: ${error.message}`);
    }
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`${API_BASE}/transactions/${userId}`);
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de récupérer l'historique: ${error.message}`);
    }
  },

  async saveTransaction(userId: string, tx: Transaction): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tx, userId }),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Échec de la transaction: ${error.message}`);
    }
  },

  async addMeter(userId: string, meter: MeterEntry): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/meters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meter, userId }),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible d'ajouter le compteur: ${error.message}`);
    }
  },

  async updateSettings(userId: string, settings: {
    alertSettings?: AlertSettings;
    autoRechargeSettings?: AutoRechargeSettings;
    notificationPreferences?: NotificationPreferences;
    securitySettings?: SecuritySettings;
    currentCredit?: number;
  }): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/settings/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Échec de la mise à jour des paramètres: ${error.message}`);
    }
  },

  async getScheduled(userId: string): Promise<ScheduledRecharge[]> {
    try {
      const response = await fetch(`${API_BASE}/scheduled/${userId}`);
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de récupérer les recharges programmées: ${error.message}`);
    }
  },

  async addScheduled(userId: string, scheduled: ScheduledRecharge): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/scheduled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scheduled, userId }),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de programmer la recharge: ${error.message}`);
    }
  },

  async updateScheduledStatus(id: string, status: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/scheduled/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de mettre à jour le statut: ${error.message}`);
    }
  },

  async deleteScheduled(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/scheduled/${id}`, {
        method: 'DELETE',
      });
      await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible d'annuler la recharge: ${error.message}`);
    }
  },

  async getConsumptionStats(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/consumption-stats/${userId}`);
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de récupérer les statistiques de consommation: ${error.message}`);
    }
  },

  async getDatabaseState(): Promise<Record<string, any[]>> {
    try {
      const response = await fetch(`${API_BASE}/admin/db`);
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de récupérer la base de données: ${error.message}`);
    }
  },

  async getAdminUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/admin/users`);
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de récupérer les utilisateurs: ${error.message}`);
    }
  },

  async getAdminTransactions(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/admin/transactions`);
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de récupérer les transactions: ${error.message}`);
    }
  },

  async getAdminStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/admin/stats`);
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de récupérer les statistiques: ${error.message}`);
    }
  },

  async toggleAdminStatus(userId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/toggle-admin`, {
        method: 'POST',
      });
      return await handleResponse(response);
    } catch (error: any) {
      throw new Error(`Impossible de modifier les droits d'administration: ${error.message}`);
    }
  }
};

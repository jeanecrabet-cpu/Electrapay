
export enum Operator {
  ORANGE = 'Orange Money',
  MTN = 'MTN MoMo',
  MOOV = 'Moov Money',
  WAVE = 'Wave',
  WALLET = 'Portefeuille ElectraPay'
}

export enum MeterType {
  STANDARD = 'Standard (Clavier)',
  SMART = 'Intelligent (Automatique)'
}

export interface MeterEntry {
  number: string;
  alias: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  defaultMeter: string; // Gardé pour compatibilité ascendante
  meters: MeterEntry[];
  walletBalance: number;
  avatar?: string;
  createdAt: string;
  isAdmin?: boolean;
}

export interface NotificationPreferences {
  channels: {
    sms: boolean;
    push: boolean;
    email: boolean;
  };
  categories: {
    transactions: boolean;
    alerts: boolean;
    tips: boolean;
  };
}

export interface SecuritySettings {
  biometricLock: boolean;
  twoFactorAuth: boolean;
  dataSharing: boolean;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AlertSettings {
  enabled: boolean;
  threshold: number;
  lastNotified: number | null;
  soundEnabled?: boolean;
  vibrateEnabled?: boolean;
  volume?: number;
  vibratePattern?: 'short' | 'long' | 'urgent';
  soundType?: 'beep' | 'wave' | 'urgent';
  reminders?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    channels: {
      sms: boolean;
      push: boolean;
    };
  };
}

export interface AutoRechargeSettings {
  enabled: boolean;
  amount: number;
  operator: Operator;
  triggerThreshold: number;
  soundEnabled?: boolean;
  vibrateEnabled?: boolean;
  volume?: number;
  vibratePattern?: 'short' | 'long' | 'urgent';
}

export interface ScheduledRecharge {
  id: string;
  date: string;
  amount: number;
  operator: Operator;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface ConsumptionData {
  power: number; // Watts
  voltage: number; // Volts
  current: number; // Amps
  timestamp: number;
}

export interface Transaction {
  id: string;
  meterNumber: string;
  amount: number;
  operator: Operator;
  meterType: MeterType;
  token: string;
  date: string;
  status: 'success' | 'pending' | 'failed';
  isWalletTopUp?: boolean;
}

export interface AppState {
  user: User | null;
  currentCredit: number;
  alertSettings: AlertSettings;
  autoRechargeSettings: AutoRechargeSettings;
  notificationPreferences: NotificationPreferences;
  securitySettings: SecuritySettings;
  scheduledRecharges: ScheduledRecharge[];
  consumptionHistory: ConsumptionData[];
}

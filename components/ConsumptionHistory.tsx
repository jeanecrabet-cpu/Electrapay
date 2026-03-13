import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ConsumptionData } from '../types';
import { Calendar, Filter, Info, Activity } from 'lucide-react';

interface ConsumptionHistoryProps {
  history: ConsumptionData[];
  stats?: any[];
}

const CustomTooltip = ({ active, payload, period }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isRealtime = period === 'realtime';
    
    return (
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xl text-slate-900 text-[11px] space-y-2 min-w-[200px]">
        <p className="font-bold border-b border-slate-100 pb-2 mb-2 text-blue-600 flex items-center justify-between gap-4">
          <span>{data.label}</span>
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        </p>
        <div className="space-y-2">
          <div className="flex justify-between gap-6">
            <span className="text-slate-500 font-medium">Consommation</span>
            <span className="font-bold text-slate-900">
              {isRealtime ? `${(data.kwh * 1000).toFixed(3)} Wh` : `${data.kwh.toFixed(2)} kWh`}
            </span>
          </div>
          {isRealtime && data.power && (
            <div className="flex justify-between gap-6">
              <span className="text-slate-500 font-medium">Puissance</span>
              <span className="font-bold text-slate-900">{data.power.toFixed(0)} W</span>
            </div>
          )}
          {!isRealtime && data.peakPower && (
            <div className="flex justify-between gap-6">
              <span className="text-slate-500 font-medium">Pic de puissance</span>
              <span className="font-bold text-slate-900">{data.peakPower} W</span>
            </div>
          )}
          {!isRealtime && data.autonomy && (
            <div className="flex justify-between gap-6">
              <span className="text-slate-500 font-medium">Autonomie estimée</span>
              <span className="font-bold text-slate-900">{data.autonomy} jours</span>
            </div>
          )}
        </div>
        <p className="text-slate-400 text-[9px] italic mt-2 pt-2 border-t border-slate-100">Cliquez pour voir les détails</p>
      </div>
    );
  }
  return null;
};

export const ConsumptionHistory: React.FC<ConsumptionHistoryProps> = ({ history, stats }) => {
  const [period, setPeriod] = useState<'realtime' | 'day' | 'month' | 'year'>('realtime');
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  const chartData = useMemo(() => {
    const data = [];
    const now = Date.now();
    
    if (period === 'realtime') {
      return history.map(d => ({
        timestamp: d.timestamp,
        label: new Date(d.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        kwh: (d.power / 1000) / 3600, // Real-time consumption in kWh per second
        power: d.power
      }));
    }

    if (stats && stats.length > 0) {
      const periodStats = stats.filter(s => s.period === period);
      if (periodStats.length > 0) {
        return periodStats.map(s => ({
          timestamp: s.timestamp,
          label: s.label,
          kwh: s.kwh,
          peakPower: s.peakPower,
          autonomy: s.autonomy
        }));
      }
    }

    if (period === 'day') {
      // Static data for the last 7 days
      const staticDailyKwh = [12.5, 14.2, 11.8, 15.6, 13.1, 10.5, 14.8];
      const staticPeakPower = [3200, 4100, 2900, 4500, 3800, 2700, 4300];
      const staticAutonomy = [5, 4, 6, 4, 5, 7, 4];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        data.push({
          timestamp: date.getTime(),
          label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
          kwh: staticDailyKwh[6 - i],
          peakPower: staticPeakPower[6 - i],
          autonomy: staticAutonomy[6 - i]
        });
      }
    } else if (period === 'month') {
      // Static data for the last 12 months
      const staticMonthlyKwh = [320, 290, 310, 280, 350, 410, 430, 390, 340, 310, 330, 360];
      const staticPeakPower = [4500, 4200, 4600, 4100, 5200, 5800, 6100, 5500, 4800, 4400, 4700, 5100];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.push({
          timestamp: date.getTime(),
          label: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          kwh: staticMonthlyKwh[11 - i],
          peakPower: staticPeakPower[11 - i]
        });
      }
    } else if (period === 'year') {
      // Static data for the last 5 years
      const staticYearlyKwh = [3800, 4100, 3950, 4200, 4050];
      const staticPeakPower = [6200, 6500, 6100, 6800, 6400];
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        data.push({
          timestamp: date.getTime(),
          label: date.getFullYear().toString(),
          kwh: staticYearlyKwh[4 - i],
          peakPower: staticPeakPower[4 - i]
        });
      }
    }
    return data;
  }, [period, history, stats]);

  const totalConsumption = chartData.reduce((acc, curr) => acc + curr.kwh, 0);

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setSelectedPoint(data.activePayload[0].payload);
    }
  };

  // Reset selected point when period changes
  React.useEffect(() => {
    setSelectedPoint(null);
  }, [period]);

  const isRealtime = period === 'realtime';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Période globale</label>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 transition-colors appearance-none"
          >
            <option value="realtime">Temps réel (40 dernières secondes)</option>
            <option value="day">Par Jour (7 derniers jours)</option>
            <option value="month">Par Mois (12 derniers mois)</option>
            <option value="year">Par Année (5 dernières années)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total sur la période globale</p>
            <h3 className="text-3xl font-mono text-slate-900">
              {isRealtime ? (totalConsumption * 1000).toFixed(2) : totalConsumption.toFixed(1)} 
              <span className="text-sm font-sans text-slate-500">{isRealtime ? ' Wh' : ' kWh'}</span>
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            {isRealtime ? <Activity size={24} className="animate-pulse" /> : <Calendar size={24} />}
          </div>
        </div>

        <div className="h-64 w-full -mx-2 cursor-pointer">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} onClick={handleChartClick}>
              <defs>
                <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
              <Tooltip content={<CustomTooltip period={period} />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="kwh" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorKwh)" animationDuration={isRealtime ? 0 : 800} activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {selectedPoint && (
        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 shadow-sm animate-slide-down flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Info size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Détails pour la période sélectionnée</p>
              <h4 className="text-lg font-bold text-slate-900">{selectedPoint.label}</h4>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 sm:text-right">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Consommation</p>
              <p className="text-xl font-mono font-bold text-blue-600">
                {isRealtime ? (selectedPoint.kwh * 1000).toFixed(3) : selectedPoint.kwh.toFixed(2)} 
                <span className="text-sm font-sans text-blue-500">{isRealtime ? ' Wh' : ' kWh'}</span>
              </p>
            </div>
            {selectedPoint.peakPower && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pic de puissance</p>
                <p className="text-xl font-mono font-bold text-slate-700">
                  {selectedPoint.peakPower} <span className="text-sm font-sans text-slate-500">W</span>
                </p>
              </div>
            )}
            {selectedPoint.autonomy && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Autonomie</p>
                <p className="text-xl font-mono font-bold text-emerald-600">
                  {selectedPoint.autonomy} <span className="text-sm font-sans text-emerald-500">jours</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
        {chartData.slice().reverse().map((data, index) => (
          <div 
            key={index} 
            onClick={() => setSelectedPoint(data)}
            className={`p-4 transition-colors flex items-center justify-between cursor-pointer ${selectedPoint?.label === data.label ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
          >
            <span className={`font-medium ${selectedPoint?.label === data.label ? 'text-blue-700' : 'text-slate-700'}`}>{data.label}</span>
            <span className={`font-bold font-mono ${selectedPoint?.label === data.label ? 'text-blue-700' : 'text-slate-900'}`}>
              {isRealtime ? `${(data.kwh * 1000).toFixed(3)} Wh` : `${data.kwh.toFixed(2)} kWh`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

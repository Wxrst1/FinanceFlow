
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { getMonthlyData, getCategoryData, t } from '@/utils';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#f97316', '#ec4899'];

const CustomTooltip = ({ active, payload, label, formatMoney, language }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-xl">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm flex justify-between gap-4">
            <span>{entry.name}:</span>
            <span className="font-mono">{formatMoney ? formatMoney(entry.value) : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyChart = () => {
  const { transactions, formatMoney, language } = useFinance();
  const data = getMonthlyData(transactions);

  return (
    <div className="h-full w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
          <Tooltip content={<CustomTooltip formatMoney={formatMoney} language={language} />} cursor={{stroke: '#3f3f46', strokeWidth: 1}} />
          <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryChart = () => {
  const { transactions, formatMoney, language } = useFinance();
  const data = getCategoryData(transactions);

  if (data.length === 0) return <div className="h-full flex items-center justify-center text-text-muted">Sem dados</div>;

  return (
    <div className="h-full w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
            {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(value: number) => formatMoney(value)} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WeeklyChart = () => {
    const { transactions, formatMoney, language } = useFinance();
    const data = [
        { name: 'Seg', value: 120 }, { name: 'Ter', value: 200 }, { name: 'Qua', value: 150 },
        { name: 'Qui', value: 80 }, { name: 'Sex', value: 250 }, { name: 'Sab', value: 300 }, { name: 'Dom', value: 100 }
    ];
    return (
        <div className="h-full w-full min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa' }} />
                    <Tooltip content={<CustomTooltip formatMoney={formatMoney} language={language} />} cursor={{fill: '#27272a', opacity: 0.4}} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ExpenseHeatmap = () => {
    const { transactions, formatMoney } = useFinance();
    // Mock generation
    const days = Array.from({length: 30}, (_, i) => ({ 
        date: new Date(Date.now() - i * 86400000), 
        value: Math.random() * 100 
    })).reverse();

    return (
        <div className="grid grid-cols-10 gap-2 h-full content-center justify-center p-4 min-h-[200px]">
            {days.map((d, i) => (
                <div key={i} className={`aspect-square rounded-md ${d.value > 50 ? 'bg-green-500' : 'bg-zinc-800'} opacity-${Math.floor(d.value/10)*10}`} title={d.date.toLocaleDateString()} />
            ))}
        </div>
    );
};

export const AccountBalanceChart = () => {
    const { accounts } = useFinance();
    const data = accounts.map(a => ({ name: a.name, value: a.balance }));
    if (data.length === 0) return <div className="h-full flex items-center justify-center text-text-muted">Sem contas</div>;
    return (
        <div className="h-full w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <CartesianGrid stroke="#27272a" />
                    <XAxis dataKey="name" hide />
                    <Tooltip />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};


import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { useFinance } from '../contexts/FinanceContext';
import { getMonthlyData, getCategoryData, t } from '../utils';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#f97316', '#ec4899'];

const CustomTooltip = ({ active, payload, label, formatMoney, language }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-xl">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm flex justify-between gap-4">
            <span>
              {entry.name === 'income' ? t('chart_income', language) : 
               entry.name === 'expense' ? t('chart_expense', language) : 
               entry.name === 'balance' ? t('chart_balance', language) :
               entry.name}
            :</span>
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
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#a1a1aa', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#a1a1aa', fontSize: 12 }} 
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip formatMoney={formatMoney} language={language} />} cursor={{stroke: '#3f3f46', strokeWidth: 1}} />
          <Line 
            type="monotone" 
            dataKey="income" 
            name="income"
            stroke="#22c55e" 
            strokeWidth={3} 
            dot={{ r: 0 }} 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            name="expense"
            stroke="#ef4444" 
            strokeWidth={3} 
            dot={{ r: 0 }} 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BalanceChart = () => {
    const { transactions, formatMoney, language } = useFinance();
    const data = getMonthlyData(transactions).map(item => ({
        ...item,
        balance: item.income - item.expense
    }));
  
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a1a1aa', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a1a1aa', fontSize: 12 }} 
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip formatMoney={formatMoney} language={language} />} cursor={{fill: '#27272a', opacity: 0.4}} />
            <Bar dataKey="balance" name="balance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

export const CategoryChart = () => {
  const { transactions, formatMoney, language } = useFinance();
  const data = getCategoryData(transactions);

  if (data.length === 0) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-text-muted">
            <p>{t('no_expenses_chart', language)}</p>
        </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: number) => formatMoney(value)}
             contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
          />
          <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WeeklyChart = () => {
    const { transactions, formatMoney, language } = useFinance();
    const data = React.useMemo(() => {
        const days = language === 'pt' 
            ? ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
            : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Go back to Sunday
        startOfWeek.setHours(0,0,0,0);
        
        const weekData = days.map(day => ({ name: day.slice(0,3), full: day, value: 0 }));
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

        transactions.forEach(t => {
            if (t.type === 'expense') {
                const tDate = new Date(t.date);
                if (tDate >= startOfWeek && tDate < endOfWeek) {
                    weekData[tDate.getDay()].value += t.amount;
                }
            }
        });
        return weekData;
    }, [transactions, language]);

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip formatMoney={formatMoney} language={language} />} cursor={{fill: '#27272a', opacity: 0.4}} />
                    <Bar dataKey="value" name={t('chart_spending', language)} fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ExpenseHeatmap = () => {
    const { transactions, formatMoney } = useFinance();
    
    const days = React.useMemo(() => {
        const result = [];
        // Increase range to cover more visible history
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            const amount = transactions
                .filter(t => t.type === 'expense' && new Date(t.date).toISOString().startsWith(dateStr))
                .reduce((acc, t) => acc + t.amount, 0);
            
            let intensity = 0;
            if (amount > 0) intensity = 1;
            if (amount > 50) intensity = 2;
            if (amount > 150) intensity = 3;
            if (amount > 500) intensity = 4;

            result.push({ date: d, intensity, amount });
        }
        return result;
    }, [transactions]);

    return (
        <div className="grid grid-cols-10 gap-2 h-full content-center justify-center p-4 overflow-hidden">
            {days.map((day, i) => (
                <div 
                    key={i} 
                    className={`aspect-square rounded-md transition-all hover:scale-110 relative group cursor-help ${
                        day.intensity === 0 ? 'bg-zinc-800' :
                        day.intensity === 1 ? 'bg-green-900/60' :
                        day.intensity === 2 ? 'bg-green-700' :
                        day.intensity === 3 ? 'bg-green-500' :
                        'bg-green-400'
                    }`}
                >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-zinc-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-20 shadow-lg">
                        {day.date.toLocaleDateString()}: {formatMoney(day.amount)}
                    </div>
                </div>
            ))}
        </div>
    );
}

export const AccountBalanceChart = () => {
    const { transactions, accounts, formatMoney, language } = useFinance();
    
    const data = React.useMemo(() => {
        const months = [];
        // Last 6 months
        for(let i=5; i>=0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            d.setDate(1); // Set to first of month to ensure month stability
            months.push(d);
        }

        return months.map(m => {
             const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0);
             endOfMonth.setHours(23, 59, 59, 999);

             const point: any = {
                 name: m.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', { month: 'short' }),
             };

             // Calculate balance for EACH account at this point in time
             accounts.forEach(acc => {
                 let bal = acc.initialBalance || 0;
                 
                 const accTxs = transactions.filter(t => 
                     t.accountId === acc.id && 
                     new Date(t.date) <= endOfMonth
                 );

                 const income = accTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                 const expense = accTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                 
                 point[acc.id] = bal + income - expense;
             });
             
             return point;
        });
    }, [transactions, accounts, language]);

    if (accounts.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-text-muted">
                <p>{t('add_accounts_chart', language)}</p>
            </div>
        )
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        {accounts.map((acc) => (
                            <linearGradient key={acc.id} id={`color-${acc.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={acc.color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={acc.color} stopOpacity={0}/>
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip formatMoney={formatMoney} language={language} />} cursor={{stroke: '#3b82f6', strokeWidth: 1}} />
                    
                    {accounts.map((acc) => (
                        <Area 
                            key={acc.id}
                            type="monotone" 
                            dataKey={acc.id} 
                            name={acc.name}
                            stroke={acc.color} 
                            fillOpacity={1} 
                            fill={`url(#color-${acc.id})`} 
                            strokeWidth={2} 
                            stackId="1"
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

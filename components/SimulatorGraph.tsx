
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SimulationResult } from '../types';
import { useFinance } from '../contexts/FinanceContext';

interface SimulatorGraphProps {
    result: SimulationResult;
}

const SimulatorGraph: React.FC<SimulatorGraphProps> = ({ result }) => {
    const { formatMoney } = useFinance();

    // Merge data for chart
    const chartData = result.baseline.map((point, i) => ({
        date: point.date,
        baseline: point.balance,
        simulated: result.simulated[i]?.balance
    }));

    // Sample down to avoid heavy rendering (every 7 days)
    const sampledData = chartData.filter((_, i) => i % 7 === 0);

    return (
        <div className="h-[350px] w-full bg-surface border border-border rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampledData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#71717a" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSimulated" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={result.verdict === 'positive' ? '#22c55e' : '#ef4444'} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={result.verdict === 'positive' ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short' })}
                        minTickGap={30}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                        formatter={(value: number) => formatMoney(value)}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    
                    <Area 
                        type="monotone" 
                        dataKey="baseline" 
                        name="Cenário Atual"
                        stroke="#71717a" 
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorBaseline)" 
                    />
                    <Area 
                        type="monotone" 
                        dataKey="simulated" 
                        name="Simulação"
                        stroke={result.verdict === 'positive' ? '#22c55e' : '#ef4444'} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSimulated)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SimulatorGraph;

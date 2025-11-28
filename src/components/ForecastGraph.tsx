
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ForecastPoint } from '../types';
import { useFinance } from '../contexts/FinanceContext';

interface ForecastGraphProps {
    data: ForecastPoint[];
}

const CustomTooltip = ({ active, payload, label, formatMoney }: any) => {
    if (active && payload && payload.length) {
        const point = payload[0].payload as ForecastPoint;
        return (
            <div className="bg-surface border border-border p-3 rounded-lg shadow-xl text-xs">
                <p className="text-white font-bold mb-1">
                    {new Date(label).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </p>
                <p className={`text-sm font-mono ${point.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {formatMoney(point.balance)}
                </p>
                {point.event && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-text-muted">
                        Evt: <span className="text-white">{point.event}</span>
                    </div>
                )}
                {point.isProjected && (
                    <div className="mt-1 text-[10px] text-blue-400 uppercase font-bold tracking-wider">
                        Projeção
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const ForecastGraph: React.FC<ForecastGraphProps> = ({ data }) => {
    const { formatMoney } = useFinance();

    if (!data || data.length === 0) return null;

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        tickFormatter={(str) => new Date(str).getDate().toString()}
                        minTickGap={30}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip formatMoney={formatMoney} />} cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                    
                    <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorBalance)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ForecastGraph;

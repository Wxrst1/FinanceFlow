import React from 'react';
import { Investment } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp, TrendingDown, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

interface InvestmentCardProps {
    investment: Investment;
    onEdit: (investment: Investment) => void;
    onDelete: (id: string) => void;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment, onEdit, onDelete }) => {
    const { currency, language } = useFinance();

    const profitLoss = investment.currentValue - investment.initialCost;
    const profitLossPercent = investment.initialCost > 0 ? (profitLoss / investment.initialCost) * 100 : 0;
    const isPositive = profitLoss >= 0;

    return (
        <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/30 transition-all group relative">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-xs text-text-muted uppercase tracking-wider font-bold">{investment.type}</span>
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px]">{investment.name}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onEdit(investment)} 
                        className="p-1.5 hover:bg-white/10 rounded text-text-muted hover:text-white transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => onDelete(investment.id)} 
                        className="p-1.5 hover:bg-red-500/10 rounded text-text-muted hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-text-muted mb-1">Valor Atual</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(investment.currentValue, currency, language)}</p>
                </div>
                <div>
                    <p className="text-xs text-text-muted mb-1">Custo Inicial</p>
                    <p className="text-sm font-mono text-zinc-400">{formatCurrency(investment.initialCost, currency, language)}</p>
                </div>
            </div>

            <div className={`flex items-center justify-between pt-4 border-t border-white/5 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                <div className="flex items-center gap-1 text-sm font-bold">
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{isPositive ? '+' : ''}{profitLossPercent.toFixed(2)}%</span>
                </div>
                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded">
                    {isPositive ? '+' : ''}{formatCurrency(profitLoss, currency, language)}
                </span>
            </div>
        </div>
    );
};

export default InvestmentCard;
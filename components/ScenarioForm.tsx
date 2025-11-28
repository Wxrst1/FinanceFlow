
import React, { useState, useMemo } from 'react';
import { Scenario, ScenarioType } from '../types';
import { generateId } from '../utils';
import { Plus, Scissors, TrendingUp, ShoppingBag, Repeat, Calendar, Tag, Euro } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

interface ScenarioFormProps {
    onAdd: (scenario: Scenario) => void;
}

const ScenarioForm: React.FC<ScenarioFormProps> = ({ onAdd }) => {
    const { transactions } = useFinance();
    const [type, setType] = useState<ScenarioType>('expense_cut');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');

    // LISTA DE CATEGORIAS PADRÃO + CATEGORIAS DO HISTÓRICO
    // Garante que o dropdown nunca vem vazio
    const uniqueCategories = useMemo(() => {
        const defaults = [
            'Alimentação', 'Habitação', 'Transporte', 'Lazer', 
            'Saúde', 'Educação', 'Assinaturas', 'Shopping', 
            'Investimentos', 'Outros'
        ];
        // Combina defaults com categorias já usadas pelo utilizador e remove duplicados
        const fromHistory = transactions.map(t => t.category);
        return Array.from(new Set([...defaults, ...fromHistory])).sort();
    }, [transactions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!description) return;

        const newScenario: Scenario = {
            id: generateId(),
            type,
            description,
            active: true,
            category: type === 'expense_cut' ? category : undefined,
            percentage: type === 'expense_cut' ? Number(amount) : undefined,
            amount: type !== 'expense_cut' ? Number(amount) : undefined,
            date: type === 'big_purchase' ? new Date(date).toISOString() : undefined
        };

        onAdd(newScenario);
        
        // Reset
        setAmount('');
        setCategory('');
        setDate('');
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-surface/50 p-4 rounded-xl border border-border">
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {[
                    { id: 'expense_cut', label: 'Cortar Gastos', icon: Scissors },
                    { id: 'income_boost', label: 'Aumentar Renda', icon: TrendingUp },
                    { id: 'big_purchase', label: 'Compra Grande', icon: ShoppingBag },
                    { id: 'recurring_expense', label: 'Novo Gasto Fixo', icon: Repeat },
                ].map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => setType(opt.id as ScenarioType)}
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                            ${type === opt.id 
                                ? 'bg-primary/20 text-primary border border-primary/50' 
                                : 'bg-zinc-800 text-zinc-400 border border-transparent hover:bg-zinc-700'}
                        `}
                    >
                        <opt.icon size={16} />
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {/* Descrição */}
                <input 
                    type="text"
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={type === 'expense_cut' ? "Ex: Menos jantares fora" : type === 'income_boost' ? "Ex: Freelance extra" : "Descrição da simulação"}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Campos Dinâmicos */}
                    {type === 'expense_cut' && (
                        <>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                <select
                                    required
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-primary appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Selecione Categoria</option>
                                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">%</span>
                                <input 
                                    type="number"
                                    required
                                    min="1"
                                    max="100"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="Redução % (ex: 20)"
                                    className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-2.5 text-white outline-none focus:border-primary"
                                />
                            </div>
                        </>
                    )}

                    {(type === 'income_boost' || type === 'recurring_expense' || type === 'big_purchase') && (
                        <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input 
                                type="number"
                                required
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Valor (€)"
                                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-primary"
                            />
                        </div>
                    )}

                    {type === 'big_purchase' && (
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input 
                                type="date"
                                required
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-primary"
                            />
                        </div>
                    )}
                </div>
            </div>

            <button 
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
            >
                <Plus size={18} />
                Adicionar Cenário
            </button>
        </form>
    );
};

export default ScenarioForm;

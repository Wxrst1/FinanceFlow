
import React from 'react';
import { CoachingAction } from '../types';
import { CheckCircle2, Circle, TrendingUp, ShieldAlert, PiggyBank, Zap, ArrowRight } from 'lucide-react';

interface CoachingCardProps {
  action: CoachingAction;
  onToggle: (id: string) => void;
}

const CoachingCard: React.FC<CoachingCardProps> = ({ action, onToggle }) => {
  
  const getIcon = (category: string) => {
      switch(category) {
          case 'debt': return <ShieldAlert size={20} className="text-red-500" />;
          case 'savings': return <PiggyBank size={20} className="text-green-500" />;
          case 'investing': return <TrendingUp size={20} className="text-blue-500" />;
          default: return <Zap size={20} className="text-yellow-500" />;
      }
  };

  const getImpactBadge = (impact: string) => {
      switch(impact) {
          case 'high': return <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Alto Impacto</span>;
          case 'medium': return <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Médio Impacto</span>;
          default: return null;
      }
  };

  return (
    <div 
        className={`
            relative p-5 rounded-xl border transition-all duration-300 group
            ${action.isCompleted 
                ? 'bg-surface/30 border-border opacity-60' 
                : 'bg-surface border-border hover:border-primary/30 hover:bg-surface/80'
            }
        `}
    >
        <div className="flex items-start gap-4">
            <button 
                onClick={() => onToggle(action.id)}
                className={`
                    mt-1 shrink-0 transition-colors
                    ${action.isCompleted ? 'text-green-500' : 'text-zinc-600 hover:text-primary'}
                `}
            >
                {action.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>

            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/5 rounded-lg">
                            {getIcon(action.category)}
                        </div>
                        {getImpactBadge(action.impact)}
                    </div>
                </div>
                
                <h3 className={`font-semibold text-lg mb-1 ${action.isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                    {action.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                    {action.description}
                </p>
            </div>
        </div>
        
        {!action.isCompleted && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                <ArrowRight size={16} />
            </div>
        )}
    </div>
  );
};

export default CoachingCard;

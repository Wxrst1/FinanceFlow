
import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { t } from '../utils';
import { Trophy, Crown, Medal, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const LevelCard = () => {
    const { userLevel, language } = useFinance();

    const getLevelIcon = (level: string) => {
        switch(level) {
            case 'Platina': return <Crown size={28} className="text-blue-300" />;
            case 'Ouro': return <Trophy size={28} className="text-yellow-400" />;
            case 'Prata': return <Medal size={28} className="text-slate-300" />;
            default: return <Star size={28} className="text-orange-400" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch(level) {
            case 'Platina': return 'from-blue-400 to-cyan-300';
            case 'Ouro': return 'from-yellow-400 to-amber-500';
            case 'Prata': return 'from-slate-300 to-zinc-400';
            default: return 'from-orange-400 to-amber-700';
        }
    };

    return (
        <div className="bg-surface border border-border p-6 rounded-xl h-full flex flex-col justify-between relative overflow-hidden group hover:border-primary/20 transition-all">
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getLevelColor(userLevel.currentLevel)} opacity-10 blur-3xl rounded-full transform translate-x-10 -translate-y-10`} />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Nível Atual</p>
                    <h3 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getLevelColor(userLevel.currentLevel)}`}>
                        {t(`level_${userLevel.currentLevel.toLowerCase()}`, language)}
                    </h3>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm shadow-lg">
                    {getLevelIcon(userLevel.currentLevel)}
                </div>
            </div>

            <div className="relative z-10 mt-4">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-text-muted">{t('xp_score', language)}: <span className="text-white font-bold">{userLevel.score}</span></span>
                    {userLevel.nextLevel !== 'Max' && (
                        <span className="text-text-muted">{t('next_level', language)}: {t(`level_${userLevel.nextLevel.toLowerCase()}`, language)}</span>
                    )}
                </div>
                
                <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${userLevel.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(userLevel.currentLevel)} relative`}
                    >
                        {/* Shine effect */}
                        <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LevelCard;

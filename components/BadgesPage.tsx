
import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { t } from '../utils';
import { Medal, Lock, CheckCircle2, Footprints, PiggyBank, ShieldCheck, Trophy, Anchor, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import LevelCard from './LevelCard';

const BadgesPage = () => {
    const { achievements, language, userLevel } = useFinance();

    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'Footprints': return Footprints;
            case 'PiggyBank': return PiggyBank;
            case 'ShieldCheck': return ShieldCheck;
            case 'Trophy': return Trophy;
            case 'Anchor': return Anchor;
            case 'TrendingUp': return TrendingUp;
            default: return Medal;
        }
    };

    return (
        <div className="p-8 animate-fade-in max-w-6xl mx-auto pb-24">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Trophy className="text-yellow-500" />
                        {t('achievements', language)}
                    </h1>
                    <p className="text-text-muted">
                        Desbloqueie insígnias à medida que melhora a sua saúde financeira.
                    </p>
                </div>
                
                <div className="w-full md:w-80 h-40">
                    <LevelCard />
                </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Medal className="text-primary" size={20} />
                Galeria de Insígnias
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((badge, index) => {
                    const Icon = getIcon(badge.icon);
                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                relative p-6 rounded-xl border overflow-hidden group transition-all duration-300
                                ${badge.isUnlocked 
                                    ? 'bg-surface border-border hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]' 
                                    : 'bg-surface/50 border-white/5 opacity-60 grayscale'
                                }
                            `}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`
                                    p-4 rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110
                                    ${badge.isUnlocked ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-500'}
                                `}>
                                    <Icon size={32} />
                                </div>
                                {badge.isUnlocked ? (
                                    <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase border border-green-500/30 flex items-center gap-1">
                                        <CheckCircle2 size={10} /> {t('unlocked', language)}
                                    </div>
                                ) : (
                                    <div className="px-2 py-1 rounded bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase border border-zinc-700 flex items-center gap-1">
                                        <Lock size={10} /> {t('locked', language)}
                                    </div>
                                )}
                            </div>

                            <h3 className={`text-lg font-bold mb-2 ${badge.isUnlocked ? 'text-white' : 'text-zinc-400'}`}>
                                {t(badge.titleKey, language)}
                            </h3>
                            <p className="text-sm text-text-muted leading-relaxed">
                                {t(badge.descKey, language)}
                            </p>

                            {!badge.isUnlocked && badge.progress !== undefined && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1 uppercase font-bold">
                                        <span>Progresso</span>
                                        <span>{badge.progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-600 rounded-full" style={{ width: `${badge.progress}%` }} />
                                    </div>
                                </div>
                            )}
                            
                            {/* Shine Effect for Unlocked */}
                            {badge.isUnlocked && (
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default BadgesPage;

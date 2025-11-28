
import { Transaction, Goal, Asset, BankAccount, FinancialScore, Achievement, UserLevel, Investment, User } from "../types";

export const GamificationService = {
    
    calculateLevel: (score: number): UserLevel => {
        let currentLevel: UserLevel['currentLevel'] = 'Bronze';
        let nextLevel: UserLevel['nextLevel'] = 'Prata';
        let progress = 0;

        if (score >= 90) {
            currentLevel = 'Platina';
            nextLevel = 'Max';
            progress = 100;
        } else if (score >= 70) {
            currentLevel = 'Ouro';
            nextLevel = 'Platina';
            progress = ((score - 70) / (90 - 70)) * 100;
        } else if (score >= 40) {
            currentLevel = 'Prata';
            nextLevel = 'Ouro';
            progress = ((score - 40) / (70 - 40)) * 100;
        } else {
            currentLevel = 'Bronze';
            nextLevel = 'Prata';
            progress = (score / 40) * 100;
        }

        return {
            currentLevel,
            nextLevel,
            progress: Math.min(100, Math.max(0, progress)),
            score
        };
    },

    checkAchievements: (
        transactions: Transaction[],
        goals: Goal[],
        assets: Asset[],
        investments: Investment[],
        scoreData: FinancialScore
    ): Achievement[] => {
        const achievements: Achievement[] = [
            {
                id: 'first_step',
                titleKey: 'badge_first_step',
                descKey: 'badge_first_step_desc',
                icon: 'Footprints',
                isUnlocked: transactions.length > 0,
                progress: transactions.length > 0 ? 100 : 0
            },
            {
                id: 'saver',
                titleKey: 'badge_saver',
                descKey: 'badge_saver_desc',
                icon: 'PiggyBank',
                isUnlocked: scoreData.breakdown.savingsRate.value >= 20,
                progress: Math.min(100, (scoreData.breakdown.savingsRate.value / 20) * 100)
            },
            {
                id: 'debt_free',
                titleKey: 'badge_debt_free',
                descKey: 'badge_debt_free_desc',
                icon: 'ShieldCheck',
                isUnlocked: assets.filter(a => a.type === 'liability').length === 0 && assets.length > 0,
                progress: assets.filter(a => a.type === 'liability').length === 0 ? 100 : 0
            },
            {
                id: 'goal_keeper',
                titleKey: 'badge_goal_keeper',
                descKey: 'badge_goal_keeper_desc',
                icon: 'Trophy',
                isUnlocked: goals.some(g => g.currentAmount >= g.targetAmount),
                progress: goals.length > 0 ? Math.min(100, Math.max(...goals.map(g => (g.currentAmount / g.targetAmount) * 100))) : 0
            },
            {
                id: 'safe_harbor',
                titleKey: 'badge_safe_harbor',
                descKey: 'badge_safe_harbor_desc',
                icon: 'Anchor',
                isUnlocked: scoreData.breakdown.emergencyFund.value >= 6,
                progress: Math.min(100, (scoreData.breakdown.emergencyFund.value / 6) * 100)
            },
            {
                id: 'investor',
                titleKey: 'badge_investor',
                descKey: 'badge_investor_desc',
                icon: 'TrendingUp',
                isUnlocked: investments.length > 0 || assets.some(a => a.type === 'investment' || a.type === 'crypto' || a.type === 'real_estate'),
                progress: (investments.length > 0 || assets.some(a => a.type === 'investment')) ? 100 : 0
            }
        ];

        return achievements;
    },

    // New Reward Check
    checkRewardEligibility: (user: User | null, achievements: Achievement[]): boolean => {
        if (!user || user.plan !== 'starter') return false;
        
        // Logic: Unlock 3 badges to get a reward
        const unlockedCount = achievements.filter(a => a.isUnlocked).length;
        
        // In a real app, we would check if they already claimed it in DB
        // For demo, we check local storage flag
        const hasClaimed = localStorage.getItem('financeflow_reward_claimed');
        
        return unlockedCount >= 3 && !hasClaimed;
    }
};

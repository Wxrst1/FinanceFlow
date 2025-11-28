
import { FinancialScore, Achievement, UserLevel } from "../types";
export const GamificationService = {
    calculateLevel: (score: number): UserLevel => ({ currentLevel: 'Bronze', nextLevel: 'Prata', progress: 0, score }),
    checkAchievements: (t: any[], g: any[], a: any[], i: any[], s: FinancialScore): Achievement[] => [],
    checkRewardEligibility: (u: any, a: Achievement[]): boolean => false
};

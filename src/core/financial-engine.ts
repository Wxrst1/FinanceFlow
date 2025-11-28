import { Transaction, BankAccount, RiskAnalysis } from '@/core/schema';

export class FinancialEngine {
  
  /**
   * Calcula o Património Líquido (Net Worth)
   */
  static calculateNetWorth(accounts: BankAccount[], assetsValue: number, liabilitiesValue: number): number {
    const liquidity = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
    return (liquidity + assetsValue) - liabilitiesValue;
  }

  /**
   * Calcula a Taxa de Queima (Burn Rate) diária baseada nos últimos X dias
   */
  static calculateBurnRate(transactions: Transaction[], days = 90): number {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);

    const expenses = transactions.filter(t => 
      t.type === 'expense' && 
      !t.isTransfer &&
      new Date(t.date) >= cutoff &&
      // Excluir categorias que distorcem a média diária (ex: Renda, Investimentos)
      !['Habitação', 'Investimentos', 'Housing', 'Investment'].includes(t.category)
    ).reduce((sum, t) => sum + t.amount, 0);

    return expenses / days;
  }

  /**
   * Calcula o "Runway" (dias até o dinheiro acabar)
   */
  static calculateRunway(liquidity: number, burnRate: number): number {
    if (burnRate <= 0) return 999; // Infinito
    return Math.floor(liquidity / burnRate);
  }

  /**
   * Análise de Risco completa
   */
  static analyzeRisk(transactions: Transaction[], accounts: BankAccount[], fixedMonthlyCost: number): RiskAnalysis {
      const totalLiquidity = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
      
      // Burn Rate Variável (Diário)
      const variableDailyBurn = this.calculateBurnRate(transactions, 30);
      
      // Burn Rate Total (Diário) = Variável + (Fixo Mensal / 30)
      const totalDailyBurn = variableDailyBurn + (fixedMonthlyCost / 30);

      const daysUntilEmpty = this.calculateRunway(totalLiquidity, totalDailyBurn);

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (daysUntilEmpty < 30) riskLevel = 'high';
      else if (daysUntilEmpty < 90) riskLevel = 'medium';

      return {
          riskLevel,
          burnRate: totalDailyBurn,
          daysUntilEmpty,
          projectedBalance: totalLiquidity - (totalDailyBurn * 30) // Projeção para 30 dias
      };
  }
}
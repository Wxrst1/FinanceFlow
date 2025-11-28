import { Debt, DebtStrategy, PayoffProjection } from './schema';

export class DebtEngine {
  
  /**
   * Calcula a projeção de pagamento para uma única dívida ou carteira
   */
  static calculatePayoff(
    debts: Debt[], 
    extraPayment: number = 0, 
    strategy: DebtStrategy = 'avalanche'
  ): PayoffProjection {
    // 1. Ordenar dívidas baseada na estratégia
    const sortedDebts = [...debts].sort((a, b) => {
      if (strategy === 'avalanche') {
        return b.interestRate - a.interestRate; // Maior juro primeiro (Matematicamente melhor)
      } else {
        return a.currentBalance - b.currentBalance; // Menor saldo primeiro (Psicologicamente melhor - Snowball)
      }
    });

    let totalInterestPaid = 0;
    let months = 0;
    
    // Simulação profunda (Deep Clone para não mutar estado original)
    let activeDebts = sortedDebts.map(d => ({ ...d }));
    const amortizationSchedule: PayoffProjection['monthlyAmortization'] = [];

    let totalBalance = activeDebts.reduce((acc, d) => acc + d.currentBalance, 0);

    while (totalBalance > 0 && months < 360) { // Limite de 30 anos para evitar loops infinitos
      months++;
      let monthlyAvailable = extraPayment;
      let monthlyInterest = 0;
      let monthlyPrincipal = 0;

      // 1. Pagar mínimos de todas
      activeDebts.forEach(debt => {
        if (debt.currentBalance <= 0) return;

        const interest = (debt.currentBalance * (debt.interestRate / 100)) / 12;
        monthlyInterest += interest;
        totalInterestPaid += interest;

        // O pagamento não pode ser maior que o saldo + juros
        let payment = Math.min(debt.minimumPayment, debt.currentBalance + interest);
        
        // Abater juros primeiro
        let principal = payment - interest;
        
        // Se pagamento mínimo não cobre juros, a dívida cresce (cenário crítico)
        if (principal < 0) {
           debt.currentBalance += Math.abs(principal);
           principal = 0;
        } else {
           debt.currentBalance -= principal;
           monthlyPrincipal += principal;
        }
        
        // Se pagou a dívida, o valor do mínimo fica disponível para a próxima (Rollover)
        if (debt.currentBalance <= 0.01) {
            monthlyAvailable += debt.minimumPayment;
            debt.currentBalance = 0;
        }
      });

      // 2. Usar extraPayment + Rollovers na dívida prioritária (Snowball/Avalanche)
      for (const debt of activeDebts) {
        if (debt.currentBalance > 0) {
          const extra = Math.min(monthlyAvailable, debt.currentBalance);
          debt.currentBalance -= extra;
          monthlyPrincipal += extra;
          monthlyAvailable -= extra;
          if (monthlyAvailable <= 0) break;
        }
      }

      totalBalance = activeDebts.reduce((acc, d) => acc + d.currentBalance, 0);

      amortizationSchedule.push({
        month: months,
        balance: totalBalance,
        interestPaid: monthlyInterest,
        principalPaid: monthlyPrincipal
      });
    }

    const today = new Date();
    const debtFreeDate = new Date(today.setMonth(today.getMonth() + months));

    return {
      debtFreeDate,
      totalInterestPaid,
      monthsToPayoff: months,
      monthlyAmortization: amortizationSchedule
    };
  }
}
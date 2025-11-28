
import { Transaction, FixedExpense, Subscription, RecurringTransaction } from "../types";

export interface CalendarDayData {
    date: Date;
    day: number;
    isToday: boolean;
    isFuture: boolean;
    isPadding: boolean; 
    income: number;
    expense: number;
    balance: number;
    transactions: CalendarTransaction[];
}

export interface CalendarTransaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    isProjected: boolean; 
}

export const CalendarService = {
    getMonthData: (
        year: number, 
        month: number, 
        transactions: Transaction[],
        fixedExpenses: FixedExpense[],
        subscriptions: Subscription[],
        recurring: RecurringTransaction[]
    ): CalendarDayData[] => {
        const today = new Date();
        today.setHours(0,0,0,0);

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay()); 

        const endDate = new Date(lastDayOfMonth);
        if (endDate.getDay() < 6) {
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
        }

        const calendar: CalendarDayData[] = [];
        const iterDate = new Date(startDate);

        while (iterDate <= endDate) {
            const isPadding = iterDate.getMonth() !== month;
            const isFuture = iterDate > today;
            const isToday = iterDate.getTime() === today.getTime();
            const dayNum = iterDate.getDate();
            
            const dayTransactions: CalendarTransaction[] = [];

            // 1. Real Transactions
            const realTxs = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getDate() === dayNum && 
                       tDate.getMonth() === iterDate.getMonth() && 
                       tDate.getFullYear() === iterDate.getFullYear();
            });

            realTxs.forEach(t => {
                dayTransactions.push({
                    id: t.id,
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    category: t.category,
                    isProjected: false
                });
            });

            // 2. Projected Transactions
            if (isFuture || isToday) {
                // Fixed Expenses
                fixedExpenses.forEach(f => {
                    if (f.day === dayNum) {
                        const exists = realTxs.some(t => Math.abs(t.amount - f.amount) < 0.01);
                        if (!exists) {
                            dayTransactions.push({
                                id: `fixed_${f.id}_${dayNum}`,
                                description: f.description,
                                amount: f.amount,
                                type: 'expense',
                                category: f.category,
                                isProjected: true
                            });
                        }
                    }
                });

                // Subscriptions
                subscriptions.forEach(s => {
                    if (!s.active) return;
                    let matches = false;
                    if (s.billingCycle === 'monthly') {
                        const subDay = new Date(s.nextPaymentDate).getDate();
                        matches = subDay === dayNum;
                    } else {
                        const nextPay = new Date(s.nextPaymentDate);
                        matches = nextPay.getDate() === dayNum && nextPay.getMonth() === iterDate.getMonth();
                    }

                    if (matches) {
                        const exists = realTxs.some(t => Math.abs(t.amount - s.amount) < 0.01);
                        if (!exists) {
                            dayTransactions.push({
                                id: `sub_${s.id}_${dayNum}`,
                                description: s.name,
                                amount: s.amount,
                                type: 'expense',
                                category: s.category,
                                isProjected: true
                            });
                        }
                    }
                });
            }

            const income = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const expense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

            calendar.push({
                date: new Date(iterDate),
                day: dayNum,
                isToday,
                isFuture,
                isPadding,
                income,
                expense,
                balance: income - expense,
                transactions: dayTransactions
            });

            iterDate.setDate(iterDate.getDate() + 1);
        }

        return calendar;
    }
};

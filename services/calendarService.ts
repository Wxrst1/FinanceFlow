
import { Transaction, FixedExpense, Subscription, RecurringTransaction } from "../types";
import { generateId } from "../utils";

export interface CalendarDayData {
    date: Date;
    day: number;
    isToday: boolean;
    isFuture: boolean;
    isPadding: boolean; // True if day belongs to prev/next month
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
    isProjected: boolean; // True if it comes from fixed/recurring settings
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
        
        // Start date (can be in prev month to fill grid)
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Go back to Sunday

        // End date (can be in next month)
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

            // 1. Real Transactions (Historical & Current)
            // Only add real transactions if they exist for this date
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

            // 2. Projected Transactions (Only for Future or Today)
            if (isFuture || isToday) {
                // A. Fixed Expenses
                fixedExpenses.forEach(f => {
                    if (f.day === dayNum) {
                        // Check if we already have a real transaction matching this (simple duplicate check)
                        const exists = realTxs.some(t => t.amount === f.amount && t.description === f.description);
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

                // B. Subscriptions
                subscriptions.forEach(s => {
                    if (!s.active) return;
                    const nextPay = new Date(s.nextPaymentDate);
                    // Check if subscription payment falls on this day in this specific month/year
                    // Logic simplified: if day matches and month matches interval
                    // For MVP: Assuming monthly cycle, just check day. 
                    // For Yearly: check full date match.
                    
                    let matches = false;
                    if (s.billingCycle === 'monthly') {
                        const subDay = new Date(s.nextPaymentDate).getDate();
                        matches = subDay === dayNum;
                    } else {
                        matches = nextPay.getDate() === dayNum && nextPay.getMonth() === iterDate.getMonth();
                    }

                    if (matches) {
                        const exists = realTxs.some(t => t.amount === s.amount && t.description === s.name);
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

                // C. Recurring (Salary, etc)
                recurring.forEach(r => {
                    if (!r.active) return;
                    if (r.dayOfMonth === dayNum) {
                         const exists = realTxs.some(t => t.amount === r.amount && t.description === r.description);
                         if (!exists) {
                             dayTransactions.push({
                                 id: `rec_${r.id}_${dayNum}`,
                                 description: r.description,
                                 amount: r.amount,
                                 type: r.type,
                                 category: r.category,
                                 isProjected: true
                             });
                         }
                    }
                });
            }

            // Summarize
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

            // Next day
            iterDate.setDate(iterDate.getDate() + 1);
        }

        return calendar;
    }
};

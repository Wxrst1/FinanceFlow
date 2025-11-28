
import { Transaction, FixedExpense, Subscription, RecurringTransaction } from "../types";
export interface CalendarDayData { date: Date; day: number; isToday: boolean; isFuture: boolean; isPadding: boolean; income: number; expense: number; balance: number; transactions: any[]; }
export const CalendarService = {
    getMonthData: (year: number, month: number, transactions: Transaction[], fixed: FixedExpense[], subs: Subscription[], rec: RecurringTransaction[]): CalendarDayData[] => []
};

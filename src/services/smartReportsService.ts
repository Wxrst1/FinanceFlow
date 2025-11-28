
import { Transaction, ReportData, MonthlyReport, LanguageCode, CurrencyCode } from "../types";
import { PerformanceApi } from "./performanceApi";

export const SmartReportsService = {
    generateAnalysis: (transactions: Transaction[], language: LanguageCode = 'pt'): ReportData => {
        // Mock analysis logic (Keep lightweight logic on client if needed for immediate feedback)
        // Ideally, this should also move to Edge if it iterates arrays > 1000 items
        return {
            month: 'Janeiro',
            year: 2024,
            totalIncome: 0,
            totalExpense: 0,
            netSavings: 0,
            savingsRate: 0,
            topCategories: [],
            forecast: { predictedTotalExpense: 0, remainingDays: 0, dailyAverage: 0 },
            variations: { incomeChange: 0, expenseChange: 0 }
        };
    },
    
    generateReportNarrative: async (data: ReportData, language: LanguageCode = 'pt'): Promise<MonthlyReport['narrative']> => {
        return { summary: "Resumo indisponível", trends: [], tips: [] };
    },

    generatePDF: async (report: MonthlyReport, userName: string, currency: CurrencyCode) => {
        console.log("Offloading PDF generation to Edge Network...");
        try {
            await PerformanceApi.downloadReportPDF(report, userName);
        } catch (e) {
            console.error("Failed to generate PDF via Edge:", e);
            alert("Erro ao gerar PDF. Tente novamente.");
        }
    }
};


import { Transaction, ReportData, MonthlyReport, LanguageCode, CurrencyCode } from "../types";
import { formatCurrency } from "../utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const SmartReportsService = {
    
    /**
     * 1. Análise Matemática dos Dados (Mantém-se Real)
     */
    generateAnalysis: (transactions: Transaction[], language: LanguageCode = 'pt'): ReportData => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Filtros de Data
        const currentTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && !t.isTransfer;
        });

        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear && !t.isTransfer;
        });

        // Cálculos Básicos
        const totalIncome = currentTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = currentTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const netSavings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

        const prevIncome = prevTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const prevExpense = prevTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
        const expenseChange = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;

        // Top Categorias
        const catMap = new Map<string, number>();
        currentTxs.filter(t => t.type === 'expense').forEach(t => {
            catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
        });

        const topCategories = Array.from(catMap.entries())
            .map(([name, amount]) => ({ 
                name, 
                amount, 
                percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0 
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Previsão Linear Simples
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dailyAverage = dayOfMonth > 0 ? totalExpense / dayOfMonth : 0;
        const predictedTotalExpense = totalExpense + (dailyAverage * (daysInMonth - dayOfMonth));

        return {
            month: now.toLocaleString(language === 'pt' ? 'pt-PT' : 'en-US', { month: 'long' }),
            year: currentYear,
            totalIncome,
            totalExpense,
            netSavings,
            savingsRate,
            topCategories,
            forecast: {
                predictedTotalExpense,
                remainingDays: daysInMonth - dayOfMonth,
                dailyAverage
            },
            variations: {
                incomeChange,
                expenseChange
            }
        };
    },

    /**
     * 2. Geração de Narrativa (MOCK - Templates baseados nos dados)
     * Remove dependência direta da API do Google para evitar erros de build/fetch.
     */
    generateReportNarrative: async (data: ReportData, language: LanguageCode = 'pt'): Promise<MonthlyReport['narrative']> => {
        // Simular delay de processamento de "IA"
        await new Promise(resolve => setTimeout(resolve, 2000));

        const isPositive = data.netSavings > 0;
        const savingsStatus = data.savingsRate > 20 ? "excelente" : data.savingsRate > 0 ? "positiva" : "negativa";
        const topCatName = data.topCategories.length > 0 ? data.topCategories[0].name : "N/A";
        
        const expenseDiff = data.variations.expenseChange;
        const trendText = expenseDiff > 0 ? `subiram ${expenseDiff.toFixed(1)}%` : `desceram ${Math.abs(expenseDiff).toFixed(1)}%`;

        if (language === 'pt') {
            return {
                summary: `Este mês, o seu desempenho financeiro foi ${savingsStatus}. Conseguiu uma taxa de poupança de ${data.savingsRate.toFixed(1)}%, com um saldo líquido de ${data.netSavings.toFixed(2)}. As suas despesas totais ${trendText} em comparação com o mês anterior.`,
                trends: [
                    `A categoria "${topCatName}" foi a sua maior despesa, representando ${data.topCategories[0]?.percentage.toFixed(0)}% do total.`,
                    `O seu ritmo de gastos diário médio é de ${data.forecast.dailyAverage.toFixed(2)}.`,
                    `As suas receitas variaram ${data.variations.incomeChange.toFixed(1)}% face ao mês passado.`
                ],
                tips: [
                    isPositive ? "Continue a manter a consistência para aumentar o seu fundo de emergência." : "Tente rever os gastos na sua categoria principal para voltar ao verde.",
                    "Considere definir um orçamento mais rigoroso para a próxima semana.",
                    "Verifique se tem subscrições recorrentes que já não utiliza."
                ]
            };
        } else {
            return {
                summary: `This month, your financial performance was ${savingsStatus === 'excelente' ? 'excellent' : savingsStatus === 'positiva' ? 'positive' : 'negative'}. You achieved a savings rate of ${data.savingsRate.toFixed(1)}%, with a net balance of ${data.netSavings.toFixed(2)}. Your total expenses ${expenseDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(expenseDiff).toFixed(1)}% compared to last month.`,
                trends: [
                    `"${topCatName}" was your biggest expense category, accounting for ${data.topCategories[0]?.percentage.toFixed(0)}% of the total.`,
                    `Your average daily spending rate is ${data.forecast.dailyAverage.toFixed(2)}.`,
                    `Your income varied by ${data.variations.incomeChange.toFixed(1)}% vs last month.`
                ],
                tips: [
                    isPositive ? "Keep up the consistency to boost your emergency fund." : "Try reviewing spending in your top category to get back in the green.",
                    "Consider setting a stricter budget for the coming week.",
                    "Check for recurring subscriptions you no longer use."
                ]
            };
        }
    },

    /**
     * 3. Geração de PDF (jsPDF + AutoTable) - Mantido Igual
     */
    generatePDF: (report: MonthlyReport, userName: string, currency: CurrencyCode) => {
        const doc = new jsPDF();
        const margin = 20;
        let y = 20;

        // Header Styling
        doc.setFillColor(9, 9, 11); // Dark background like app
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setFontSize(22);
        doc.setTextColor(34, 197, 94); // Brand Green
        doc.text("FinanceFlow", margin, 25);
        
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text("Smart Report Mensal", 210 - margin, 25, { align: "right" });

        y = 55;

        // Meta Info
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Cliente: ${userName}`, margin, y);
        doc.text(`Data: ${new Date(report.createdAt).toLocaleDateString()}`, 210 - margin, y, { align: "right" });
        y += 10;

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(`Análise: ${report.data.month} ${report.data.year}`, margin, y);
        y += 15;

        // Summary Section
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(1);
        doc.line(margin, y, 210 - margin, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(60);
        const splitSummary = doc.splitTextToSize(report.narrative.summary, 170);
        doc.text(splitSummary, margin, y);
        y += (splitSummary.length * 6) + 15;

        // Metrics Table
        const metricsBody = [
            ['Receita Total', formatCurrency(report.data.totalIncome, currency)],
            ['Despesa Total', formatCurrency(report.data.totalExpense, currency)],
            ['Poupança Líquida', formatCurrency(report.data.netSavings, currency)],
            ['Taxa de Poupança', `${report.data.savingsRate.toFixed(1)}%`],
            ['Variação Mensal', `${report.data.variations.expenseChange > 0 ? '+' : ''}${report.data.variations.expenseChange.toFixed(1)}%`]
        ];

        autoTable(doc, {
            startY: y,
            head: [['Indicador', 'Valor']],
            body: metricsBody,
            theme: 'grid',
            headStyles: { fillColor: [34, 197, 94], textColor: 255 },
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
            margin: { left: margin, right: margin }
        });

        // @ts-ignore
        y = doc.lastAutoTable.finalY + 15;

        // Categories Table
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("Top Despesas", margin, y);
        y += 5;

        const catBody = report.data.topCategories.map(c => [
            c.name,
            formatCurrency(c.amount, currency),
            `${c.percentage.toFixed(1)}%`
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Categoria', 'Valor', '% Total']],
            body: catBody,
            theme: 'striped',
            headStyles: { fillColor: [24, 24, 27], textColor: 255 },
            columnStyles: { 
                1: { halign: 'right' },
                2: { halign: 'right' }
            },
            margin: { left: margin, right: margin }
        });

        // @ts-ignore
        y = doc.lastAutoTable.finalY + 15;

        // Insights List
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Dicas & Tendências", margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);

        const insights = [...report.narrative.trends, ...report.narrative.tips];
        insights.forEach(item => {
            doc.text(`• ${item}`, margin, y);
            y += 6;
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`FinanceFlow Smart Report - Página ${i} de ${pageCount}`, margin, 285);
        }

        doc.save(`Relatorio_${report.data.month}_${report.data.year}.pdf`);
    }
};

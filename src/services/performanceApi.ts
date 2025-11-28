
import { supabase } from './supabase';
import { ForecastSummary, ForecastPoint } from '@/types';

/**
 * Interface para cálculos pesados delegados ao Edge.
 * Bloqueia o UI Thread por 0ms.
 */
export const PerformanceApi = {
    
    /**
     * Calcula métricas financeiras complexas no servidor
     */
    async calculateMetrics(workspaceId: string): Promise<{ burnRate: number }> {
        const { data, error } = await supabase.functions.invoke('financial-engine', {
            body: { task: 'burn_rate', workspaceId }
        });
        if (error) throw error;
        return data;
    },

    /**
     * Gera a previsão de fluxo de caixa
     */
    async getForecast(workspaceId: string, accounts: any[]): Promise<{ data: ForecastPoint[], summary: ForecastSummary }> {
        const { data, error } = await supabase.functions.invoke('financial-engine', {
            body: { task: 'forecast', workspaceId, accounts }
        });
        if (error) throw error;
        return data;
    },

    /**
     * Gera PDF no servidor e retorna URL blob para download
     */
    async downloadReportPDF(reportData: any, userName: string): Promise<void> {
        const { data, error } = await supabase.functions.invoke('generate-report', {
            body: { reportData, userName }
        });

        if (error) throw error;

        // Convert Blob to Download
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};


import { useQuery } from '@tanstack/react-query';
import { PerformanceApi } from '../services/performanceApi';
import { useFinance } from '../contexts/FinanceContext';

export const useFinancialMetrics = () => {
    const { currentWorkspace, accounts } = useFinance();
    const workspaceId = currentWorkspace?.id;

    // Cache: Burn Rate (Recalcula a cada 10 minutos apenas)
    const { data: burnRateData, isLoading: isBurnLoading } = useQuery({
        queryKey: ['burn-rate', workspaceId],
        queryFn: () => PerformanceApi.calculateMetrics(workspaceId!),
        enabled: !!workspaceId,
        staleTime: 1000 * 60 * 10, 
    });

    // Cache: Forecast (Recalcula se as contas mudarem)
    const { data: forecast, isLoading: isForecastLoading } = useQuery({
        queryKey: ['forecast', workspaceId, accounts.length], // Dependência leve
        queryFn: () => PerformanceApi.getForecast(workspaceId!, accounts),
        enabled: !!workspaceId && accounts.length > 0,
        staleTime: 1000 * 60 * 5,
    });

    return {
        burnRate: burnRateData?.burnRate || 0,
        forecast: forecast?.data || [],
        forecastSummary: forecast?.summary,
        isLoading: isBurnLoading || isForecastLoading
    };
};

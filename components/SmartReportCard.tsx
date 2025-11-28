
import React from 'react';
import { MonthlyReport } from '../types';
import { FileText, Download, Sparkles, TrendingUp, Lightbulb, Calendar } from 'lucide-react';
import { SmartReportsService } from '../services/smartReportsService';
import { useFinance } from '../contexts/FinanceContext';

interface SmartReportCardProps {
    report: MonthlyReport;
}

const SmartReportCard: React.FC<SmartReportCardProps> = ({ report }) => {
    const { user, currency, formatMoney } = useFinance();

    const handleDownload = () => {
        SmartReportsService.generatePDF(report, user?.name || 'Utilizador', currency);
    };

    return (
        <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 transition-all group flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white capitalize">{report.data.month} {report.data.year}</h3>
                        <p className="text-xs text-text-muted flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleDownload}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors"
                    title="Baixar PDF"
                >
                    <Download size={20} />
                </button>
            </div>

            {/* AI Summary */}
            <div className="mb-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-white/5 p-4 rounded-lg flex-1">
                <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Resumo IA</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                    {report.narrative.summary}
                </p>
            </div>

            {/* Key Metrics Preview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-xs text-text-muted block mb-1">Poupança</span>
                    <span className={`text-lg font-bold ${report.data.netSavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatMoney(report.data.netSavings)}
                    </span>
                </div>
                <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-xs text-text-muted block mb-1">Taxa</span>
                    <span className="text-lg font-bold text-white">
                        {report.data.savingsRate.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Insights Preview */}
            <div className="space-y-3 border-t border-white/5 pt-4">
                {report.narrative.trends?.[0] && (
                    <div className="flex gap-3 items-start text-xs text-zinc-400">
                        <TrendingUp size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{report.narrative.trends[0]}</span>
                    </div>
                )}
                {report.narrative.tips?.[0] && (
                    <div className="flex gap-3 items-start text-xs text-zinc-400">
                        <Lightbulb size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{report.narrative.tips[0]}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartReportCard;

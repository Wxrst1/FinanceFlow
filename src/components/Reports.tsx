
import React, { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { exportToCSV, generateId, t } from '@/utils';
import { FileSpreadsheet, Lock, Sparkles, Loader2, History, PieChart, BarChart } from 'lucide-react';
import UpgradeModal from './UpgradeModal';
import { SmartReportsService } from '@/services/smartReportsService';
import { ApiService } from '@/services/api';
import { MonthlyReport } from '@/types';
import SmartReportCard from './SmartReportCard';
import { CategoryChart, MonthlyChart } from './Charts';

const Reports = () => {
  const { transactions, user, language, currentWorkspace } = useFinance();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const isPro = user?.plan === 'pro' || user?.plan === 'business';

  useEffect(() => {
      loadReports();
  }, [currentWorkspace]);

  const loadReports = async () => {
      const data = await ApiService.getReports(currentWorkspace?.id);
      setReports(data);
  };

  const handleGenerateSmartReport = async () => {
      if (!isPro) {
          setIsUpgradeModalOpen(true);
          return;
      }

      setIsGenerating(true);
      try {
          const analysis = SmartReportsService.generateAnalysis(transactions, language);
          const narrative = await SmartReportsService.generateReportNarrative(analysis, language);

          const newReport: MonthlyReport = {
              id: generateId(),
              workspaceId: currentWorkspace?.id || null,
              month: new Date().getMonth(),
              year: new Date().getFullYear(),
              data: analysis,
              narrative: narrative,
              createdAt: new Date().toISOString()
          };

          await ApiService.saveReport(newReport);
          setReports(prev => [newReport, ...prev]);
      } catch (e) {
          console.error("Erro ao gerar relatório:", e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleExportCSV = () => {
    if (isPro) {
      exportToCSV(transactions);
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{t('reports_title', language)}</h1>
          <p className="text-text-muted">{t('reports_desc', language)}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
            <button
                onClick={handleGenerateSmartReport}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg border border-purple-500/30 ${
                    isPro ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20' : 'bg-zinc-800 text-text-muted hover:text-white'
                }`}
            >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className={isPro ? "text-white" : "text-purple-500"} />}
                <span>{isGenerating ? t('analyzing', language) : t('generate_smart_report', language)}</span>
                {!isPro && <Lock size={14} className="ml-1" />}
            </button>

            <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-surface hover:bg-zinc-800 border border-border text-white px-4 py-2.5 rounded-lg font-medium transition-all"
            >
                {isPro ? <FileSpreadsheet size={20} /> : <Lock size={16} className="text-yellow-500" />}
                <span>{t('export_csv', language)}</span>
            </button>
        </div>
      </div>

      {/* Smart Reports Grid */}
      <div className="mb-12">
          <div className="flex items-center gap-2 mb-6 text-white">
              <History size={20} className="text-purple-500" />
              <h2 className="text-xl font-bold">{t('generated_reports', language)}</h2>
          </div>
          
          {reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.map(report => (
                      <SmartReportCard key={report.id} report={report} />
                  ))}
              </div>
          ) : (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-surface/30">
                  <Sparkles size={48} className="mx-auto mb-4 text-purple-500 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">{t('no_reports', language)}</h3>
                  <p className="text-text-muted mb-6">{t('no_reports_msg', language)}</p>
                  <button onClick={handleGenerateSmartReport} className="text-purple-400 hover:text-purple-300 underline">
                      {t('generate_now', language)}
                  </button>
              </div>
          )}
      </div>

      {/* Data Visualization Section - Fixed Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-border pt-12">
          <div className="bg-surface border border-border p-6 rounded-xl flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                  <PieChart size={20} className="text-primary" />
                  <h3 className="font-bold text-white">{t('cat_distribution', language)}</h3>
              </div>
              <div className="h-[350px] w-full relative">
                  <CategoryChart />
              </div>
          </div>
          <div className="bg-surface border border-border p-6 rounded-xl flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                  <BarChart size={20} className="text-blue-500" />
                  <h3 className="font-bold text-white">{t('monthly_flow', language)}</h3>
              </div>
              <div className="h-[350px] w-full relative">
                  <MonthlyChart />
              </div>
          </div>
      </div>
      
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
    </div>
  );
};

export default Reports;

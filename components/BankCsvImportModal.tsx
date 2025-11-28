
import React, { useState } from 'react';
import { Transaction } from '../types';
import { BankService } from '../services/bankService';
import { UploadCloud, FileText, AlertCircle, Check, X, Sparkles, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import Modal from './Modal';
import { formatDate } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

interface BankCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Partial<Transaction>[]) => void;
  accountName: string;
}

interface PreviewItem extends Partial<Transaction> {
    isDuplicate?: boolean;
}

const BankCsvImportModal: React.FC<BankCsvImportModalProps> = ({ isOpen, onClose, onImport, accountName }) => {
  const { transactions: history, formatMoney } = useFinance();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [hideDuplicates, setHideDuplicates] = useState(false);

  const commonCategories = [
    'Alimentação', 'Transporte', 'Habitação', 'Lazer', 'Saúde', 
    'Assinaturas', 'Shopping', 'Salário', 'Outros', 'Investimentos'
  ];

  const checkForDuplicates = (newTxs: Partial<Transaction>[]): PreviewItem[] => {
      return newTxs.map(tx => {
          const isDup = history.some(h => {
              if (!tx.date || !tx.amount) return false;
              const hDate = new Date(h.date).toISOString().split('T')[0];
              const tDate = new Date(tx.date).toISOString().split('T')[0];
              return Math.abs(h.amount - tx.amount) < 0.01 && 
                     h.description === tx.description && 
                     hDate === tDate;
          });
          return { ...tx, isDuplicate: isDup };
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      
      try {
        let data: Partial<Transaction>[] = [];
        const name = selectedFile.name.toLowerCase();
        
        if (name.endsWith('.ofx')) {
            data = await BankService.parseOFX(selectedFile, history);
        } else if (name.endsWith('.pdf')) {
            data = await BankService.parsePDF(selectedFile, history);
        } else {
            data = await BankService.parseCSV(selectedFile, history);
        }
        const dataWithDups = checkForDuplicates(data);
        setPreviewData(dataWithDups);
        setStep('preview');
      } catch (err: any) {
        setError(err.message || "Erro ao processar o ficheiro.");
      }
    }
  };

  const handleCategoryChange = (index: number, newCategory: string) => {
      const updated = [...previewData];
      updated[index] = { ...updated[index], category: newCategory };
      setPreviewData(updated);
  };

  const removeDuplicates = () => {
      setPreviewData(prev => prev.filter(t => !t.isDuplicate));
  };

  const removeRow = (index: number) => {
      setPreviewData(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const finalData = previewData.filter(t => !t.isDuplicate);
    onImport(finalData);
    handleReset();
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setStep('upload');
    setError(null);
    setHideDuplicates(false);
    onClose();
  };

  const duplicateCount = previewData.filter(t => t.isDuplicate).length;
  const visibleData = hideDuplicates ? previewData.filter(t => !t.isDuplicate) : previewData;
  
  // Stats
  const totalImportIncome = visibleData.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalImportExpense = visibleData.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title={`Importar para ${accountName}`}>
      {step === 'upload' ? (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:bg-surface/50 transition-colors relative group">
            <input
              type="file"
              accept=".csv,.txt,.ofx,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud size={40} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Arraste ou Clique para Upload</h3>
            <p className="text-text-muted text-sm">Suporta CSV, PDF, TXT ou OFX</p>
          </div>

          <div className="flex gap-3 text-xs text-text-muted justify-center">
             <span className="flex items-center gap-1"><Check size={12} className="text-green-500"/> Categorização Automática</span>
             <span className="flex items-center gap-1"><Check size={12} className="text-green-500"/> Deteção de Duplicados</span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="bg-surface border border-border p-3 rounded-lg flex items-center justify-between">
                  <span className="text-text-muted text-sm flex items-center gap-2"><TrendingUp size={14} className="text-green-500"/> Receita</span>
                  <span className="text-white font-bold">{formatMoney(totalImportIncome)}</span>
              </div>
              <div className="bg-surface border border-border p-3 rounded-lg flex items-center justify-between">
                  <span className="text-text-muted text-sm flex items-center gap-2"><TrendingDown size={14} className="text-red-500"/> Despesa</span>
                  <span className="text-white font-bold">{formatMoney(totalImportExpense)}</span>
              </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium flex items-center gap-2">
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                    <Sparkles size={10} /> {visibleData.length} transações
                </span>
            </h3>
            
            <div className="flex items-center gap-2">
                {duplicateCount > 0 && (
                    <button 
                        onClick={() => setHideDuplicates(!hideDuplicates)}
                        className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${hideDuplicates ? 'bg-yellow-500 text-black font-bold' : 'bg-surface border border-border text-text-muted'}`}
                    >
                        <Filter size={12} />
                        {hideDuplicates ? 'Mostrar Duplicados' : `Ocultar ${duplicateCount} Duplicados`}
                    </button>
                )}
                <button onClick={() => setStep('upload')} className="text-text-muted hover:text-white text-xs underline">
                    Novo Ficheiro
                </button>
            </div>
          </div>

          {duplicateCount > 0 && !hideDuplicates && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2 text-yellow-500 text-xs">
                      <AlertCircle size={14} />
                      <span>Foram detetadas {duplicateCount} transações duplicadas.</span>
                  </div>
                  <button 
                    onClick={removeDuplicates}
                    className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 px-2 py-1 rounded transition-colors font-medium border border-yellow-500/30"
                  >
                      Limpar Tudo
                  </button>
              </div>
          )}

          <div className="bg-background border border-border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface text-text-muted font-medium sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-xs uppercase tracking-wider">Data</th>
                  <th className="p-3 text-xs uppercase tracking-wider">Descrição</th>
                  <th className="p-3 text-xs uppercase tracking-wider">Categoria</th>
                  <th className="p-3 text-xs uppercase tracking-wider text-right">Valor</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-zinc-300">
                {visibleData.map((t, idx) => (
                  <tr key={idx} className={`hover:bg-white/5 group transition-colors ${t.isDuplicate ? 'bg-yellow-500/5 opacity-60' : ''}`}>
                    <td className="p-3 whitespace-nowrap text-xs">
                        {t.date ? formatDate(t.date) : '-'}
                        {t.isDuplicate && (
                            <div className="text-[9px] text-yellow-500 flex items-center gap-1 mt-0.5 font-bold uppercase tracking-wider">
                                <AlertCircle size={8} /> Existente
                            </div>
                        )}
                    </td>
                    <td className="p-3 truncate max-w-[140px] text-white" title={t.description}>{t.description}</td>
                    <td className="p-3">
                        <select 
                          value={t.category}
                          onChange={(e) => handleCategoryChange(idx, e.target.value)}
                          className="bg-zinc-900 text-xs border border-zinc-700 rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:bg-zinc-800 transition-colors w-full appearance-none"
                        >
                            {commonCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </td>
                    <td className={`p-3 text-right font-mono text-xs font-medium whitespace-nowrap ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                       {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount || 0)}
                    </td>
                    <td className="p-3 text-center">
                        <button 
                            onClick={() => removeRow(idx)}
                            className="text-zinc-600 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                            title="Remover linha"
                        >
                            <X size={14} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-text-muted hover:text-white transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={visibleData.length === 0}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20"
            >
              <Check size={16} /> 
              Confirmar {visibleData.length} Transações
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BankCsvImportModal;

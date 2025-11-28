
import { Transaction } from "../types";
import { generateId } from "../utils";
import * as pdfjsLib from 'pdfjs-dist';

// Robust handling for PDF.js import (ESM/CommonJS interop)
// In some build environments, the library is under .default, in others it's direct.
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Force worker to use CDN to avoid build path issues with relative paths
if (pdfjs.GlobalWorkerOptions) {
    // Use specific version to match package.json
    const version = pdfjs.version || '3.11.174';
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
}

export const BankService = {
  // Categorias comuns para regras estáticas (Fallback)
  CATEGORY_RULES: [
    // Transporte
    { keyword: 'uber', category: 'Transporte', type: 'expense' },
    { keyword: 'bolt', category: 'Transporte', type: 'expense' },
    { keyword: 'cp', category: 'Transporte', type: 'expense' },
    { keyword: 'metropolitano', category: 'Transporte', type: 'expense' },
    { keyword: 'via verde', category: 'Transporte', type: 'expense' },
    { keyword: 'galp', category: 'Transporte', type: 'expense' },
    { keyword: 'bp', category: 'Transporte', type: 'expense' },
    { keyword: 'repsol', category: 'Transporte', type: 'expense' },
    { keyword: 'prio', category: 'Transporte', type: 'expense' },
    
    // Alimentação / Supermercado
    { keyword: 'continente', category: 'Alimentação', type: 'expense' },
    { keyword: 'pingo doce', category: 'Alimentação', type: 'expense' },
    { keyword: 'auchan', category: 'Alimentação', type: 'expense' },
    { keyword: 'lidl', category: 'Alimentação', type: 'expense' },
    { keyword: 'aldi', category: 'Alimentação', type: 'expense' },
    { keyword: 'minipreco', category: 'Alimentação', type: 'expense' },
    { keyword: 'mercrona', category: 'Alimentação', type: 'expense' },
    { keyword: 'celeiro', category: 'Alimentação', type: 'expense' },
    { keyword: 'restaurante', category: 'Alimentação', type: 'expense' },
    { keyword: 'cafe', category: 'Alimentação', type: 'expense' },
    { keyword: 'starbucks', category: 'Alimentação', type: 'expense' },
    { keyword: 'mcdonalds', category: 'Alimentação', type: 'expense' },
    { keyword: 'burger king', category: 'Alimentação', type: 'expense' },
    
    // Lazer
    { keyword: 'cinema', category: 'Lazer', type: 'expense' },
    { keyword: 'nos', category: 'Lazer', type: 'expense' }, 
    { keyword: 'bar', category: 'Lazer', type: 'expense' },
    
    // Assinaturas / Tecnologia
    { keyword: 'netflix', category: 'Assinaturas', type: 'expense' },
    { keyword: 'spotify', category: 'Assinaturas', type: 'expense' },
    { keyword: 'apple', category: 'Assinaturas', type: 'expense' },
    { keyword: 'google', category: 'Assinaturas', type: 'expense' },
    { keyword: 'amazon prime', category: 'Assinaturas', type: 'expense' },
    { keyword: 'hbo', category: 'Assinaturas', type: 'expense' },
    { keyword: 'disney', category: 'Assinaturas', type: 'expense' },

    // Habitação / Contas
    { keyword: 'vodafone', category: 'Habitação', type: 'expense' },
    { keyword: 'meo', category: 'Habitação', type: 'expense' },
    { keyword: 'edp', category: 'Habitação', type: 'expense' },
    { keyword: 'endesa', category: 'Habitação', type: 'expense' },
    { keyword: 'goldenergy', category: 'Habitação', type: 'expense' },
    { keyword: 'epal', category: 'Habitação', type: 'expense' },
    { keyword: 'aguas', category: 'Habitação', type: 'expense' },
    { keyword: 'condominio', category: 'Habitação', type: 'expense' },
    { keyword: 'renda', category: 'Habitação', type: 'expense' },
    
    // Saúde
    { keyword: 'farmacia', category: 'Saúde', type: 'expense' },
    { keyword: 'hospital', category: 'Saúde', type: 'expense' },
    { keyword: 'cuf', category: 'Saúde', type: 'expense' },
    { keyword: 'lusiadas', category: 'Saúde', type: 'expense' },
    { keyword: 'clinica', category: 'Saúde', type: 'expense' },
    { keyword: 'wells', category: 'Saúde', type: 'expense' },

    // Shopping
    { keyword: 'zara', category: 'Shopping', type: 'expense' },
    { keyword: 'primark', category: 'Shopping', type: 'expense' },
    { keyword: 'h&m', category: 'Shopping', type: 'expense' },
    { keyword: 'fnac', category: 'Shopping', type: 'expense' },
    { keyword: 'worten', category: 'Shopping', type: 'expense' },
    { keyword: 'amazon', category: 'Shopping', type: 'expense' },

    // Receitas
    { keyword: 'salario', category: 'Salário', type: 'income' },
    { keyword: 'ordenado', category: 'Salário', type: 'income' },
    { keyword: 'vencimento', category: 'Salário', type: 'income' },
    { keyword: 'transferencia', category: 'Outros', type: 'income' },
    { keyword: 'mbway', category: 'Outros', type: 'income' }, 
  ],

  // 1. Smart Categorization (History + Rules)
  predictCategory: (description: string, amount: number, history: Transaction[]) => {
      const lowerDesc = description.toLowerCase();
      
      // A. History Match (Simulated AI Learning)
      const similarTransactions = history.filter(t => 
          t.description.toLowerCase().includes(lowerDesc) || 
          lowerDesc.includes(t.description.toLowerCase())
      );

      if (similarTransactions.length > 0) {
          const frequency: Record<string, number> = {};
          similarTransactions.forEach(t => {
              frequency[t.category] = (frequency[t.category] || 0) + 1;
          });
          const bestMatch = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
          const matchedTx = similarTransactions.find(t => t.category === bestMatch);
          const type = matchedTx ? matchedTx.type : (amount >= 0 ? 'income' : 'expense');
          return { category: bestMatch, type };
      }

      // B. Static Rules
      for (const rule of BankService.CATEGORY_RULES) {
          if (lowerDesc.includes(rule.keyword)) {
              let type = rule.type;
              // Conflict resolution: if amount is positive but rule says expense (e.g. refund), assume income
              if (amount > 0) type = 'income';
              if (amount < 0) type = 'expense';
              
              return { category: rule.category, type: type as 'income' | 'expense' };
          }
      }

      // C. Default
      return { 
          category: 'Outros', 
          type: (amount >= 0 ? 'income' : 'expense') as 'income' | 'expense' 
      };
  },

  // Helper: Parse different date formats
  parseDate: (dateStr: string): string => {
      try {
          // Handle DD/MM/YYYY or DD-MM-YYYY
          if (dateStr.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{4}/)) {
              const parts = dateStr.split(/[/-]/);
              return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
          }
          // Handle YYYY-MM-DD
          if (dateStr.match(/^\d{4}[/-]\d{2}[/-]\d{2}/)) {
              return new Date(dateStr).toISOString();
          }
          // Fallback
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) return d.toISOString();
      } catch (e) {}
      return new Date().toISOString();
  },

  // Helper: Parse currency string
  parseAmount: (amountStr: string): number => {
      // Remove currency symbols and spaces
      let clean = amountStr.replace(/[€$£\s]/g, '');
      
      // Check format: 1.234,56 (EU) vs 1,234.56 (US)
      if (clean.includes(',') && clean.includes('.')) {
          if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
              // EU format: remove dots, replace comma with dot
              clean = clean.replace(/\./g, '').replace(',', '.');
          } else {
              // US format: remove commas
              clean = clean.replace(/,/g, '');
          }
      } else if (clean.includes(',')) {
          // Assume EU if only comma exists
          clean = clean.replace(',', '.');
      }
      
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
  },

  // 2. CSV Parser
  parseCSV: async (file: File, history: Transaction[] = []): Promise<Partial<Transaction>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvText = event.target?.result as string;
          const lines = csvText.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length < 2) {
            reject(new Error("O ficheiro parece estar vazio ou inválido."));
            return;
          }

          const delimiter = lines[0].includes(';') ? ';' : ',';
          
          // Simple Header Detection
          const headers = lines[0].toLowerCase().split(delimiter).map(h => h.trim().replace(/"/g, ''));
          
          // Find indices
          let dateIdx = headers.findIndex(h => h.includes('data') || h.includes('date') || h.includes('dt'));
          let descIdx = headers.findIndex(h => h.includes('desc') || h.includes('mov') || h.includes('name') || h.includes('memo'));
          let amountIdx = headers.findIndex(h => h.includes('valor') || h.includes('montante') || h.includes('amount') || h.includes('eur'));

          // Fallback indices if no headers found
          if (dateIdx === -1) dateIdx = 0;
          if (descIdx === -1) descIdx = 1;
          if (amountIdx === -1) amountIdx = headers.length > 2 ? 2 : 1; // fallback

          const transactions: Partial<Transaction>[] = [];

          // Start loop from 1 to skip header
          for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(delimiter).map(col => col.trim().replace(/"/g, ''));
            if (columns.length < 2) continue;

            const dateStr = columns[dateIdx];
            const descStr = columns[descIdx];
            const amountStr = columns[amountIdx];

            if (!amountStr) continue;

            const amount = BankService.parseAmount(amountStr);
            const dateISO = BankService.parseDate(dateStr);
            const { category, type } = BankService.predictCategory(descStr, amount, history);

            transactions.push({
                id: generateId(),
                date: dateISO,
                description: descStr,
                amount: Math.abs(amount),
                type: type, // Keep calculated type (if amount was negative, it's expense)
                category: category,
                tags: ['Importado']
            });
          }
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler o ficheiro."));
      reader.readAsText(file);
    });
  },

  // 3. OFX Parser
  parseOFX: async (file: File, history: Transaction[] = []): Promise<Partial<Transaction>[]> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const text = event.target?.result as string;
                  const transactions: Partial<Transaction>[] = [];

                  const regex = /<STMTTRN>[\s\S]*?<DTPOSTED>([\d]+)[\s\S]*?<TRNAMT>([\-\d\.]+)[\s\S]*?<(NAME|MEMO)>([^<]+)/g;
                  
                  let match;
                  while ((match = regex.exec(text)) !== null) {
                      const dateRaw = match[1]; 
                      const amountStr = match[2];
                      const descStr = match[4].trim();
                      
                      const year = dateRaw.substring(0, 4);
                      const month = dateRaw.substring(4, 6);
                      const day = dateRaw.substring(6, 8);
                      const dateISO = `${year}-${month}-${day}T12:00:00.000Z`;

                      const amount = parseFloat(amountStr);
                      if (isNaN(amount)) continue;

                      const { category, type } = BankService.predictCategory(descStr, amount, history);

                      transactions.push({
                          id: generateId(),
                          date: dateISO,
                          description: descStr,
                          amount: Math.abs(amount),
                          type: type,
                          category: category,
                          tags: ['Importado']
                      });
                  }

                  if (transactions.length === 0) {
                      reject(new Error("Nenhuma transação encontrada ou formato OFX inválido."));
                  } else {
                      resolve(transactions);
                  }
              } catch (e) {
                  reject(new Error("Erro ao processar ficheiro OFX."));
              }
          };
          reader.onerror = () => reject(new Error("Erro ao ler o ficheiro."));
          reader.readAsText(file);
      });
  },

  // 4. PDF Parser (Static Import)
  parsePDF: async (file: File, history: Transaction[] = []): Promise<Partial<Transaction>[]> => {
      return new Promise(async (resolve, reject) => {
          try {
              const arrayBuffer = await file.arrayBuffer();
              // Use the resolved pdfjs object
              const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
              const transactions: Partial<Transaction>[] = [];
              
              for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  
                  // Group by Y coordinate to form lines
                  const linesMap: Record<number, string[]> = {};
                  textContent.items.forEach((item: any) => {
                      const y = Math.round(item.transform[5]);
                      const existingY = Object.keys(linesMap).map(Number).find(key => Math.abs(key - y) < 5);
                      const key = existingY !== undefined ? existingY : y;
                      
                      if (!linesMap[key]) linesMap[key] = [];
                      linesMap[key].push(item.str);
                  });

                  const sortedY = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
                  
                  for (const y of sortedY) {
                      const lineStr = linesMap[y].join(' ').trim();
                      const regex = /^(\d{2}[-\/]\d{2}[-\/]\d{4}|\d{4}[-\/]\d{2}[-\/]\d{2})\s+(.+?)\s+([\-\+]?[\d\.\,\s]+)$/;
                      const match = regex.exec(lineStr);
                      
                      if (match) {
                          const dateStr = match[1];
                          let descStr = match[2].trim();
                          const amountStr = match[3];
                          
                          if (descStr.toLowerCase().includes('saldo') || descStr.toLowerCase().includes('balance')) continue;
                          
                          const amount = BankService.parseAmount(amountStr);
                          if (isNaN(amount) || amount === 0) continue;

                          const dateISO = BankService.parseDate(dateStr);
                          const { category, type } = BankService.predictCategory(descStr, amount, history);

                          transactions.push({
                              id: generateId(),
                              date: dateISO,
                              description: descStr,
                              amount: Math.abs(amount),
                              type: type,
                              category: category,
                              tags: ['Importado', 'PDF']
                          });
                      }
                  }
              }
              
              if (transactions.length === 0) {
                  throw new Error("Nenhuma transação identificada. O layout do PDF pode não ser compatível.");
              }
              
              resolve(transactions);
          } catch (e: any) {
              reject(new Error("Erro ao processar PDF: " + e.message));
          }
      });
  }
};

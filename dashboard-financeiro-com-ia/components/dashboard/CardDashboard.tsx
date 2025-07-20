
import React, { useState, useMemo, useRef, FC, useEffect } from 'react';
import Papa from 'papaparse';
import { RawCreditCardTransaction, CreditCardTransaction, CreditCardSummary, TimeFilter, TimeFilterType, ComparisonCategoryData, CategoryGoalData, GoalComparisonData, AverageSpendData, CategoryData, CreditCardAnalysisData } from '../../types';
import { categorizeCreditCardTransactions, CREDIT_CARD_CATEGORIES, generateCardAnalysis } from '../../services/geminiService';
import { formatCurrency, parseCurrencyValue, parseDate, formatDate, getPreviousPeriod } from '../../utils/helpers';
import { CreditCardIcon, RotateCwIcon, BarChart3Icon, BanknoteIcon, DownloadIcon, FileSpreadsheetIcon, FileTextIcon, TrashIcon, CheckIcon, XIcon } from '../icons';
import { SummaryCard } from '../ui/SummaryCard';
import { TimeFilterBar } from '../ui/TimeFilterBar';
import { CategoryChart } from '../charts/CategoryChart';
import { CategoryComparisonChart } from '../charts/CategoryComparisonChart';
import { CategoryGoals } from '../goals/CategoryGoals';
import { GoalsComparisonChart } from '../charts/GoalsComparisonChart';
import { AverageSpendChart } from '../charts/AverageSpendChart';
import { IntelligentAnalysisCard } from '../analysis/IntelligentAnalysisCard';
import { exportToExcel, exportToPdf } from '../../utils/export';

interface CardDashboardProps {
    transactions: CreditCardTransaction[];
    setTransactions: React.Dispatch<React.SetStateAction<CreditCardTransaction[]>>;
    processedFiles: string[];
    setProcessedFiles: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CardDashboard: FC<CardDashboardProps> = ({ transactions, setTransactions, processedFiles, setProcessedFiles }) => {
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>({ type: 'all' });
    const [goals, setGoals] = useState<Record<string, number>>({});
    const [cardCategories, setCardCategories] = useState<string[]>(() => [...CREDIT_CARD_CATEGORIES].sort());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [analysis, setAnalysis] = useState('');
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [tableFilters, setTableFilters] = useState({ category: 'all', description: '' });
    const [editingRow, setEditingRow] = useState<{ id: string; newCategory: string } | null>(null);


    const handleGoalChange = (category: string, value: number) => {
        setGoals(prev => ({ ...prev, [category]: value }));
    };
    
    const handleTimeFilterChange = (filter: TimeFilter) => {
        setTimeFilter(filter);
        setTableFilters({ category: 'all', description: '' });
        setAnalysis('');
    };
    
    const handleCancelEdit = () => {
        setEditingRow(null);
    };

    const handleSaveNewCategory = (transactionId: string) => {
        if (!editingRow || editingRow.newCategory.trim() === '') {
            handleCancelEdit();
            return;
        }
        const trimmedCategory = editingRow.newCategory.trim();
        if (!cardCategories.includes(trimmedCategory)) {
            setCardCategories(prev => [...prev, trimmedCategory].sort());
        }
        setTransactions(prevTransactions =>
            prevTransactions.map(t =>
                t.id === transactionId ? { ...t, category: trimmedCategory } : t
            )
        );
        handleCancelEdit();
    };


    const handleUpdateCategory = (transactionId: string, newCategoryValue: string) => {
        if (newCategoryValue === '--ADD_NEW--') {
            setEditingRow({ id: transactionId, newCategory: '' });
        } else {
            setTransactions(prevTransactions =>
                prevTransactions.map(t =>
                    t.id === transactionId ? { ...t, category: newCategoryValue } : t
                )
            );
        }
    };
    
    const handleDeleteTransaction = (transactionId: string) => {
        if (window.confirm('Tem certeza que deseja remover esta transação? A ação não pode ser desfeita.')) {
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
        }
    };

    const handleFiles = async (data: RawCreditCardTransaction[]) => {
        setIsCategorizing(true);
        const uniqueData = data.filter(row => {
            const rowSignature = `${row.date}-${row.title}-${row.amount}`;
            return !processedFiles.includes(rowSignature);
        });

        if (uniqueData.length === 0) { setIsCategorizing(false); return; }
        const newSignatures = uniqueData.map(row => `${row.date}-${row.title}-${row.amount}`);
        const descriptions = uniqueData.map(d => d.title);
        const categories = await categorizeCreditCardTransactions(descriptions);
        const newTransactions: CreditCardTransaction[] = uniqueData.map((row, index) => ({
            id: `${Date.now()}-${index}`,
            date: parseDate(row.date)?.toISOString() ?? new Date().toISOString(),
            description: row.title,
            amount: parseCurrencyValue(row.amount),
            category: categories[index]
        }));
        setTransactions(prev => [...prev, ...newTransactions]);
        setProcessedFiles(prev => [...prev, ...newSignatures]);
        setIsCategorizing(false);
    };

    const processCardFiles = (files: File[]) => {
        let allData: RawCreditCardTransaction[] = [];
        let filesRemaining = files.length;
        const headerMap: { [key: string]: string } = { 'data': 'date', 'descrição': 'title', 'descricão': 'title', 'descricao': 'title', 'description': 'title', 'título': 'title', 'valor': 'amount' };
        files.forEach(file => {
            Papa.parse<RawCreditCardTransaction>(file, {
                header: true, skipEmptyLines: true,
                transformHeader: (header) => headerMap[header.toLowerCase().trim()] || header,
                complete: (results) => {
                    const validData = results.data.filter(row => row.date && row.title && row.amount);
                    if (validData.length !== results.data.length) {
                        alert(`Algumas linhas no arquivo '${file.name}' foram ignoradas por não conterem as colunas 'date', 'title' e 'amount'.`);
                    }
                    allData = [...allData, ...validData];
                    filesRemaining--;
                    if (filesRemaining === 0) handleFiles(allData);
                }
            });
        });
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            processCardFiles(Array.from(e.currentTarget.files));
        }
        if (e.currentTarget) { e.currentTarget.value = ''; }
    };

    const handleReset = () => {
        if (confirm('Tem certeza que deseja limpar todos os dados?')) {
            setTransactions([]); setProcessedFiles([]); setGoals({});
            setTimeFilter({ type: 'all' }); setTableFilters({ category: 'all', description: '' }); setAnalysis('');
        }
    };
    
    const handleExportExcel = async () => {
        setIsExporting(true);
        setShowExportMenu(false);
        const consolidatedData = [
            { Item: 'Gasto Total', Valor: summaryData.totalExpenses },
            { Item: 'Nº de Transações', Valor: summaryData.transactionCount },
            { Item: 'Gasto Médio por Transação', Valor: summaryData.averageSpend },
            {},
            { Item: 'Metas por Categoria' },
            ...goalComparisonChartData.map(g => ({ Categoria: g.name, Planejado: g.planned, Realizado: g.realized })),
        ];
        const transactionsData = filteredTransactions.map(t => ({
            'Data': formatDate(new Date(t.date)),
            'Descrição': t.description,
            'Categoria': t.category,
            'Valor': -t.amount,
        }));
        await exportToExcel([
            { sheetName: 'Dashboard Consolidado', data: consolidatedData },
            { sheetName: 'Base de Dados', data: transactionsData }
        ], 'Relatorio_Cartao');
        setIsExporting(false);
    };

    const handleExportPdf = async () => {
        setIsExporting(true);
        setShowExportMenu(false);
        if (dashboardRef.current) {
            await exportToPdf(dashboardRef.current, 'Relatorio_Cartao');
        }
        setIsExporting(false);
    };


    const filteredTransactions = useMemo(() => {
        if (transactions.length === 0) return [];
        let timeFiltered = transactions.filter(t => {
            if (timeFilter.type === 'all') return true;
            const tDate = new Date(t.date);
            if (timeFilter.type === 'custom') {
                 const start = timeFilter.startDate ? parseDate(timeFilter.startDate) : null;
                const end = timeFilter.endDate ? parseDate(timeFilter.endDate) : null;
                if(start && end) return tDate >= start && tDate <= end;
                if(start) return tDate >= start;
                if(end) return tDate <= end;
                return true;
            }
            const now = new Date(); now.setUTCHours(0, 0, 0, 0);
            if (timeFilter.type === 'day') return tDate.getTime() === now.getTime();
            if (timeFilter.type === 'week') {
                const firstDayOfWeek = new Date(now); firstDayOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
                const lastDayOfWeek = new Date(firstDayOfWeek); lastDayOfWeek.setUTCDate(firstDayOfWeek.getUTCDate() + 6);
                return tDate >= firstDayOfWeek && tDate <= lastDayOfWeek;
            }
            if (timeFilter.type === 'month') return tDate.getUTCFullYear() === now.getUTCFullYear() && tDate.getUTCMonth() === now.getUTCMonth();
            if (timeFilter.type === 'year') return tDate.getUTCFullYear() === now.getUTCFullYear();
            return true;
        });

        if (tableFilters.category !== 'all') {
            timeFiltered = timeFiltered.filter(t => t.category === tableFilters.category);
        }
        if (tableFilters.description.trim() !== '') {
            timeFiltered = timeFiltered.filter(t => t.description.toLowerCase().includes(tableFilters.description.toLowerCase()));
        }
        
        return timeFiltered;
    }, [transactions, timeFilter, tableFilters]);
    
    const previousPeriodRange = useMemo(() => getPreviousPeriod(timeFilter), [timeFilter]);
    const previousPeriodTransactions = useMemo(() => {
        if (!previousPeriodRange) return [];
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= previousPeriodRange.startDate && tDate <= previousPeriodRange.endDate;
        });
    }, [transactions, previousPeriodRange]);

    const summaryData = useMemo<CreditCardSummary>(() => {
        const totalExpenses = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = filteredTransactions.length;
        const averageSpend = transactionCount > 0 ? totalExpenses / transactionCount : 0;
        return { totalExpenses, transactionCount, averageSpend };
    }, [filteredTransactions]);
    
    const averageSpendData = useMemo<AverageSpendData[]>(() => {
        if (filteredTransactions.length === 0) return [];
        const categoryStats = filteredTransactions.reduce((acc, t) => {
            if (!acc[t.category]) { acc[t.category] = { total: 0, count: 0 }; }
            acc[t.category].total += t.amount; acc[t.category].count += 1;
            return acc;
        }, {} as Record<string, { total: number; count: number }>);
        return Object.entries(categoryStats).map(([name, { total, count }]) => ({ name, total, count, average: total / count })).sort((a, b) => b.average - a.average);
    }, [filteredTransactions]);

    const categoryData = useMemo<CategoryData[]>(() => {
        const grouped = filteredTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
        }, {} as Record<string, number>);
        return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);
    
    const categoryGoalsData: CategoryGoalData[] = useMemo(() => {
        return categoryData.map(category => ({
            name: category.name,
            realized: category.value,
        }));
    }, [categoryData]);

    const goalComparisonChartData = useMemo<GoalComparisonData[]>(() => {
        return categoryGoalsData.map(c => ({ name: c.name, realized: c.realized, planned: goals[c.name] || 0 }));
    }, [categoryGoalsData, goals]);

    const comparisonData = useMemo<ComparisonCategoryData[]>(() => {
        if (!previousPeriodRange || transactions.length === 0) return [];
        const currentData = filteredTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount); return acc;
        }, {} as Record<string, number>);
        const previousData = previousPeriodTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount); return acc;
        }, {} as Record<string, number>);
        const allCategories = [...new Set([...Object.keys(currentData), ...Object.keys(previousData)])];
        return allCategories
            .map(category => ({ name: category, current: currentData[category] || 0, previous: previousData[category] || 0 }))
            .sort((a, b) => b.current - a.current);
    }, [filteredTransactions, previousPeriodTransactions, previousPeriodRange]);
    
    const handleGenerateAnalysis = async () => {
        setIsAnalysisLoading(true);
        setAnalysis('');
        const analysisData: CreditCardAnalysisData = {
            summary: summaryData,
            comparisonData: comparisonData,
            goalsData: goalComparisonChartData
        };
        const result = await generateCardAnalysis(analysisData);
        setAnalysis(result);
        setIsAnalysisLoading(false);
    };

    useEffect(() => {
        setAnalysis('');
    }, [timeFilter, tableFilters]);


    if (isCategorizing) return <div className="flex items-center justify-center h-96">Analisando dados...</div>;
    
    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-end gap-2 mb-4">
                <button onClick={() => fileInputRef.current?.click()} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg no-print">
                     {transactions.length > 0 ? 'Adicionar Mais Faturas' : 'Adicionar Faturas (.csv)'}
                </button>
                 {transactions.length > 0 && (
                     <div className="relative">
                        <button onClick={() => setShowExportMenu(prev => !prev)} disabled={isExporting} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 no-print">
                            {isExporting ? 'Exportando...' : <DownloadIcon className="w-4 h-4" />}
                            {isExporting ? '' : 'Exportar Dados'}
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-20">
                                <button onClick={handleExportExcel} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2">
                                    <FileSpreadsheetIcon className="w-4 h-4"/> Excel (.xlsx)
                                </button>
                                <button onClick={handleExportPdf} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2">
                                    <FileTextIcon className="w-4 h-4"/> PDF (.pdf)
                                </button>
                            </div>
                        )}
                    </div>
                )}
                 {transactions.length > 0 && (
                    <button onClick={handleReset} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 no-print">
                        <RotateCwIcon className="w-4 h-4" /> Limpar Dados
                    </button>
                )}
                <input type="file" ref={fileInputRef} onChange={onFileChange} multiple accept=".csv" className="hidden" />
            </div>

            <div ref={dashboardRef}>
                {transactions.length > 0 && <TimeFilterBar onFilterChange={handleTimeFilterChange} activeFilter={timeFilter.type} />}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <SummaryCard title="Gasto Total" value={summaryData.totalExpenses} icon={<CreditCardIcon className="w-8 h-8 text-rose-500" />} />
                    <SummaryCard title="Nº de Transações" value={summaryData.transactionCount} icon={<BarChart3Icon className="w-8 h-8 text-sky-500" />} isCurrency={false} />
                    <SummaryCard title="Gasto Médio por Transação" value={summaryData.averageSpend} icon={<BanknoteIcon className="w-8 h-8 text-violet-500" />} />
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CategoryChart data={categoryData} title="Despesas por Categoria" />
                    <AverageSpendChart data={averageSpendData} title="Gasto Médio por Transação" />
                </div>
                 {transactions.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <CategoryGoals title="Metas por Categoria" categoriesData={categoryGoalsData} goals={goals} onGoalChange={handleGoalChange} />
                        <GoalsComparisonChart title="Planejado vs. Realizado" data={goalComparisonChartData} />
                    </div>
                )}
                {transactions.length > 0 && comparisonData.length > 0 &&
                  <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                     <CategoryComparisonChart data={comparisonData} title="Comparativo em relação ao período anterior" />
                     <IntelligentAnalysisCard 
                        title="Análise Inteligente do Período" 
                        analysis={analysis} 
                        isLoading={isAnalysisLoading}
                        showGenerateButton={true}
                        onGenerate={handleGenerateAnalysis}
                        hasDataToAnalyze={filteredTransactions.length > 0 && comparisonData.length > 0}
                     />
                  </div>
                }
    
                <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-white">Transações do Cartão</h2>
                    <div className="overflow-y-auto max-h-96">
                        <table className="w-full text-sm text-left">
                             <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Data</th>
                                    <th scope="col" className="px-6 py-3">Descrição</th>
                                    <th scope="col" className="px-6 py-3">Categoria</th>
                                    <th scope="col" className="px-6 py-3 text-right">Valor</th>
                                    <th scope="col" className="px-6 py-3 text-center no-print">Ações</th>
                                </tr>
                                <tr className="bg-gray-700/60 no-print">
                                    <td className="px-6 py-2"></td>
                                    <td className="px-6 py-2">
                                        <input
                                            type="text"
                                            placeholder="Filtrar descrição..."
                                            value={tableFilters.description}
                                            onChange={e => setTableFilters(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full bg-gray-800 text-white rounded-md px-2 py-1 text-xs border border-gray-600 focus:ring-sky-500 focus:border-sky-500"
                                        />
                                    </td>
                                    <td className="px-6 py-2">
                                        <select
                                            value={tableFilters.category}
                                            onChange={e => setTableFilters(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full bg-gray-800 text-white rounded-md px-2 py-1 text-xs border border-gray-600 focus:ring-sky-500 focus:border-sky-500"
                                        >
                                            <option value="all">Todas as Categorias</option>
                                            {cardCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-2"></td>
                                    <td className="px-6 py-2"></td>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-20 text-gray-500">Clique em "Adicionar Faturas" para ver suas transações.</td></tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-20 text-gray-500">Nenhuma transação encontrada para os filtros selecionados.</td></tr>
                                ) : (
                                    filteredTransactions.map(t => (
                                        <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                            <td className="px-6 py-4">{formatDate(new Date(t.date))}</td>
                                            <td className="px-6 py-4 font-medium text-white">{t.description}</td>
                                            <td className="px-6 py-4">
                                                {editingRow && editingRow.id === t.id ? (
                                                    <div className="flex items-center gap-1 no-print">
                                                        <input
                                                            type="text"
                                                            value={editingRow.newCategory}
                                                            onChange={(e) => setEditingRow({ ...editingRow, newCategory: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveNewCategory(t.id);
                                                                if (e.key === 'Escape') handleCancelEdit();
                                                            }}
                                                            className="bg-gray-900 text-white rounded-md px-2 py-1 text-xs w-full border border-sky-500 focus:ring-sky-500"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleSaveNewCategory(t.id)} className="p-1 text-green-500 hover:text-green-400"><CheckIcon className="w-4 h-4" /></button>
                                                        <button onClick={handleCancelEdit} className="p-1 text-red-500 hover:text-red-400"><XIcon className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={t.category}
                                                        onChange={(e) => handleUpdateCategory(t.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="bg-gray-700/80 hover:bg-gray-700 text-white rounded-md px-2 py-1 text-xs border-transparent focus:ring-sky-500 focus:border-sky-500 focus:bg-gray-600 appearance-none no-print"
                                                    >
                                                        {cardCategories.map(cat => ( <option key={cat} value={cat}>{cat}</option>))}
                                                        <option value="--ADD_NEW--">-- Adicionar Nova --</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-semibold text-red-400`}>-{formatCurrency(t.amount)}</td>
                                            <td className="px-6 py-4 text-center no-print">
                                                <button
                                                    onClick={() => handleDeleteTransaction(t.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    aria-label="Remover transação"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

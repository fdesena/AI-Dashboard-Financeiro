
export type View = 'account' | 'card';
export type TimeFilterType = 'all' | 'day' | 'week' | 'month' | 'year' | 'custom';
export interface TimeFilter { type: TimeFilterType; startDate?: string; endDate?: string; }


// --- Tipos para Dashboard da Conta ---

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface RawTransaction {
  Data: string;
  Descrição: string;
  Valor: string;
  [key:string]: string; // Allow for other columns
}

export interface Summary {
  income: number;
  expenses: number;
  balance: number;
  incomeTransactionsCount?: number;
  expenseTransactionsCount?: number;
  totalTransactionsCount?: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface ComparisonCategoryData {
    name: string;
    current: number;
    previous: number;
}

export interface CategoryGoalData {
    name: string;
    realized: number;
}

export interface GoalComparisonData {
    name: string;
    planned: number;
    realized: number;
}

export interface AnalysisData {
    summary: Summary;
    comparisonData: ComparisonCategoryData[];
    goalsData: GoalComparisonData[];
}


// --- Tipos para Análise de Cartão de Crédito ---

export interface RawCreditCardTransaction {
  date: string;
  title: string;
  amount: string;
  [key: string]: string; // Allow for other columns
}

export interface CreditCardTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
}

export interface CreditCardSummary {
    totalExpenses: number;
    transactionCount: number;
    averageSpend: number;
}

export interface CreditCardAnalysisData {
    summary: CreditCardSummary;
    comparisonData: ComparisonCategoryData[];
    goalsData: GoalComparisonData[];
}

export interface AverageSpendData {
    name: string;
    average: number;
    total: number;
    count: number;
}
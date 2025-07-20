
import { TimeFilter } from '../types';

export const formatCurrency = (value: number): string => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const parseCurrencyValue = (value: string): number => {
    if (typeof value !== 'string' || !value) return 0;
    let s = value.trim().replace(/R\$|\s/g, '');
    const hasDot = s.includes('.');
    const hasComma = s.includes(',');
    if (hasDot && hasComma) {
        s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    } else if (hasComma) { s = s.replace(',', '.'); }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
};

export const parseDate = (dateStr: string): Date | null => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const parts = dateStr.split('-').map(Number);
        const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
        return isNaN(dt.getTime()) ? null : dt;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const parts = dateStr.split('/').map(Number);
        const dt = new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
        return isNaN(dt.getTime()) ? null : dt;
    }
    return null;
};

export const formatDate = (date: Date): string => date.toLocaleDateString('pt-BR', {timeZone: 'UTC'});

export const getPreviousPeriod = (filter: TimeFilter): { startDate: Date; endDate: Date } | null => {
    let currentStartDate: Date; let currentEndDate: Date;
    if (filter.type === 'custom') {
        if (!filter.startDate || !filter.endDate) return null;
        currentStartDate = parseDate(filter.startDate) as Date; currentEndDate = parseDate(filter.endDate) as Date;
    } else {
        const now = new Date(); now.setUTCHours(0, 0, 0, 0);
        switch (filter.type) {
            case 'day': currentStartDate = new Date(now); currentEndDate = new Date(now); break;
            case 'week': currentStartDate = new Date(now); currentStartDate.setUTCDate(now.getUTCDate() - now.getUTCDay()); currentEndDate = new Date(currentStartDate); currentEndDate.setUTCDate(currentStartDate.getUTCDate() + 6); break;
            case 'month': currentStartDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); currentEndDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)); break;
            case 'year': currentStartDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)); currentEndDate = new Date(Date.UTC(now.getUTCFullYear(), 11, 31)); break;
            default: return null;
        }
    }
    if (isNaN(currentStartDate.getTime()) || isNaN(currentEndDate.getTime())) return null;
    const diff = currentEndDate.getTime() - currentStartDate.getTime();
    const previousEndDate = new Date(currentStartDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - diff);
    return { startDate: previousStartDate, endDate: previousEndDate };
};

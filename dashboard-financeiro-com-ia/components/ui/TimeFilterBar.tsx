
import React, { FC, useState } from 'react';
import { TimeFilter, TimeFilterType } from '../../types';
import { CalendarIcon } from '../icons';

export const TimeFilterBar: FC<{ onFilterChange: (filter: TimeFilter) => void; activeFilter: TimeFilterType }> = ({ onFilterChange, activeFilter }) => {
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const handleButtonClick = (type: TimeFilterType) => {
        setCustomStart(''); setCustomEnd('');
        onFilterChange({ type });
    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        const newStart = type === 'start' ? value : customStart;
        const newEnd = type === 'end' ? value : customEnd;
        if (type === 'start') setCustomStart(value); else setCustomEnd(value);
        onFilterChange({ type: 'custom', startDate: newStart, endDate: newEnd });
    };

    const buttons: { label: string; type: TimeFilterType }[] = [
        { label: 'Tudo', type: 'all' }, { label: 'Hoje', type: 'day' }, { label: 'Esta Semana', type: 'week' },
        { label: 'Este Mês', type: 'month' }, { label: 'Este Ano', type: 'year' },
    ];
    
    return (
        <div className="bg-gray-800 p-2 rounded-lg flex items-center space-x-2 mb-6 flex-wrap">
            <div className="flex items-center space-x-2 mr-4">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-white">Período</span>
            </div>
            {buttons.map(({ label, type }) => (
                <button
                    key={type}
                    onClick={() => handleButtonClick(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeFilter === type ? 'bg-sky-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    {label}
                </button>
            ))}
            <div className="flex items-center space-x-2 pl-4 border-l border-gray-600">
                <span className="text-sm text-gray-400">Personalizar:</span>
                <input type="date" value={customStart} onChange={e => handleDateChange('start', e.target.value)} className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm border-gray-600 focus:ring-sky-500 focus:border-sky-500" />
                <span className="text-gray-400">a</span>
                <input type="date" value={customEnd} onChange={e => handleDateChange('end', e.target.value)} className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm border-gray-600 focus:ring-sky-500 focus:border-sky-500" />
            </div>
        </div>
    );
};


import React, { FC } from 'react';
import { formatCurrency } from '../../utils/helpers';

export const SummaryCard: FC<{ title: string; value: number; icon: React.ReactNode, isCurrency?: boolean }> = ({ title, value, icon, isCurrency = true }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gray-700">{icon}</div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{isCurrency ? formatCurrency(value) : value.toLocaleString('pt-BR')}</p>
        </div>
    </div>
);
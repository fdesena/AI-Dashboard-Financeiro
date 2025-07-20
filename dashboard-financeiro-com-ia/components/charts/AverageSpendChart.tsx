import React, { FC } from 'react';
import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { AverageSpendData } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { BarChart3Icon } from '../icons';

const CustomTooltip = ({ active, payload, barName, totalLabel }: any) => {
    if (active && payload && payload.length) {
        const data: AverageSpendData = payload[0].payload;
        return (
            <div className="p-3 text-sm bg-gray-700 rounded-md shadow-lg border border-gray-600 space-y-1">
                <p className="font-bold text-white">{data.name}</p>
                <p style={{ color: payload[0].color }}>{barName}: {formatCurrency(data.average)}</p>
                <p className="text-gray-300">{totalLabel}: {formatCurrency(data.total)}</p>
                <p className="text-gray-300">Transações: {data.count}</p>
            </div>
        );
    }
    return null;
};


export const AverageSpendChart: FC<{ 
    data: AverageSpendData[]; 
    title: string;
    barColor?: string;
    barName?: string;
    totalLabel?: string;
}> = ({ 
    data, 
    title,
    barColor = '#8b5cf6',
    barName = 'Gasto Médio',
    totalLabel = 'Total Gasto'
}) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
                <BarChart3Icon className="w-6 h-6 mr-2" />
                {title}
            </h2>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(30 * data.length + 60, 250)}>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#d1d5db' }} tickFormatter={(value) => formatCurrency(Number(value))} domain={['dataMin', 'dataMax']} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                            content={<CustomTooltip barName={barName} totalLabel={totalLabel} />}
                        />
                        <Bar dataKey="average" name={barName} fill={barColor} radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full -mt-8"><p className="text-gray-500 text-center py-12">Sem dados para exibir.</p></div>}
        </div>
    );
};
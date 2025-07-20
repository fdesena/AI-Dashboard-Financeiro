
import React, { FC } from 'react';
import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GoalComparisonData } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { BarChart3Icon } from '../icons';

interface GoalsComparisonChartProps {
    data: GoalComparisonData[];
    title: string;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 text-sm bg-gray-700 rounded-md shadow-lg border border-gray-600">
                <p className="font-bold">{payload[0].payload.name}</p>
                {payload.map((p: any) => (
                     <p key={p.dataKey} style={{ color: p.color }}>
                        {`${p.name}: ${formatCurrency(p.value as number)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const GoalsComparisonChart: FC<GoalsComparisonChartProps> = ({ data, title }) => {
    // Filter out items where both planned and realized are zero to keep the chart clean
    const chartData = data.filter(item => item.planned > 0 || item.realized > 0);

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
                <BarChart3Icon className="w-6 h-6 mr-2 text-sky-500" />
                {title}
            </h2>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(40 * chartData.length + 60, 250)}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                        barGap={4}
                    >
                        <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#d1d5db' }} tickFormatter={(value) => formatCurrency(Number(value))} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#d1d5db' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="planned" name="Planejado" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
                        <Bar dataKey="realized" name="Realizado" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full -mt-8">
                    <p className="text-gray-500 text-center py-12">Defina metas na tabela ao lado<br />para ver a comparação aqui.</p>
                </div>
            )}
        </div>
    );
};
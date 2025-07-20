
import React, { FC } from 'react';
import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ComparisonCategoryData } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { BarChart3Icon } from '../icons';

export const CategoryComparisonChart: FC<{ data: ComparisonCategoryData[], title: string }> = ({ data, title }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><BarChart3Icon className="w-6 h-6 mr-2" />{title}</h2>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(30 * data.length + 60, 150)}>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="p-2 text-sm bg-gray-700 rounded-md shadow-lg border border-gray-600">
                                            <p className="font-bold">{payload[0].payload.name}</p>
                                            <p style={{ color: payload[0].color }}>{`${payload[0].name}: ${formatCurrency(payload[0].value as number)}`}</p>
                                            {payload[1] && <p style={{ color: payload[1].color }}>{`${payload[1].name}: ${formatCurrency(payload[1].value as number)}`}</p>}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                        <Bar dataKey="current" name="Período Atual" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={12} />
                        <Bar dataKey="previous" name="Período Anterior" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full"><p className="text-gray-500 text-center py-12">Sem dados para comparar.</p></div>}
        </div>
    );
};
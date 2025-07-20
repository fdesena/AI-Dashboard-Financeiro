
import React, { FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { CategoryData } from '../../types';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#fde047', '#ec4899', '#64748b'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return <div className="p-2 text-sm bg-gray-700 rounded-md shadow-lg border border-gray-600">
            <p className="font-bold">{`${payload[0].name}`}</p>
            <p className="text-white">{`Valor: ${formatCurrency(payload[0].value)}`}</p>
        </div>;
    }
    return null;
};


export const CategoryChart: FC<{ data: CategoryData[]; title: string }> = ({ data, title }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full">
        <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} fill="#8884d8">
                        {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        ) : <div className="flex items-center justify-center h-full -mt-8"><p className="text-gray-500 text-center py-12">Sem dados para exibir.</p></div>}
    </div>
);

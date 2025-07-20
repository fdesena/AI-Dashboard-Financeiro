import React, { FC } from 'react';
import { CategoryGoalData } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { TargetIcon } from '../icons';

interface CategoryGoalsProps {
    title: string;
    categoriesData: CategoryGoalData[];
    goals: Record<string, number>;
    onGoalChange: (category: string, value: number) => void;
}

export const CategoryGoals: FC<CategoryGoalsProps> = ({ title, categoriesData, goals, onGoalChange }) => {
    if (categoriesData.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                <TargetIcon className="w-6 h-6 mr-2 text-sky-500" />
                {title}
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Categoria</th>
                            <th scope="col" className="px-6 py-3">Planejado</th>
                            <th scope="col" className="px-6 py-3">Realizado</th>
                            <th scope="col" className="px-6 py-3 text-right">Variação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoriesData.map(({ name, realized }) => {
                            const planned = goals[name] || 0;
                            let variationText = '-';
                            let textColor = 'text-gray-400';

                            if (planned > 0) {
                                const variation = ((realized - planned) / planned) * 100;
                                variationText = `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`;
                                if (realized > planned) {
                                    textColor = 'text-red-400';
                                } else {
                                    textColor = 'text-green-400';
                                }
                            } else if (realized > 0) {
                                variationText = 'Acima';
                                textColor = 'text-red-400';
                            }

                            return (
                                <tr key={name} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-white">{name}</td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                            <input
                                                type="number"
                                                value={goals[name] || ''}
                                                onChange={(e) => onGoalChange(name, parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="bg-gray-900/50 border border-gray-600 rounded-md py-2 pl-9 pr-3 w-32 text-white focus:ring-sky-500 focus:border-sky-500"
                                                min="0"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{formatCurrency(realized)}</td>
                                    <td className={`px-6 py-4 text-right font-semibold ${textColor}`}>
                                        {variationText}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
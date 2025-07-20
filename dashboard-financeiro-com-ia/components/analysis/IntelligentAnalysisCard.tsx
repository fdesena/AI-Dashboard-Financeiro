
import React, { FC } from 'react';
import { LightbulbIcon } from '../icons';

interface IntelligentAnalysisCardProps {
    title: string;
    analysis: string;
    isLoading: boolean;
    showGenerateButton?: boolean;
    onGenerate?: () => void;
    hasDataToAnalyze?: boolean;
}

export const IntelligentAnalysisCard: FC<IntelligentAnalysisCardProps> = ({ 
    title, 
    analysis, 
    isLoading, 
    showGenerateButton = false,
    onGenerate,
    hasDataToAnalyze = true
}) => {
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full -mt-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
                        <p className="text-gray-400 mt-4">Gerando análise...</p>
                    </div>
                </div>
            );
        }

        if (showGenerateButton) {
            if (!hasDataToAnalyze) {
                return <div className="flex items-center justify-center h-full -mt-8"><p className="text-gray-500 text-center">Dados insuficientes para gerar uma análise.</p></div>;
            }
            if (analysis) {
                 return <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />;
            }
            return (
                <div className="flex flex-col items-center justify-center h-full -mt-8 text-center">
                     <p className="text-gray-400 mb-4">Clique para obter insights sobre seus gastos no período.</p>
                     <button
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                     >
                        <LightbulbIcon className="w-5 h-5" />
                        Gerar Análise Inteligente
                     </button>
                </div>
            );
        }
        
        // Default behavior for Account Dashboard
        if (analysis) {
            return <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />;
        }

        return null; // Don't show anything if not loading, no analysis, and not manual button
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full min-h-[250px]">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
                <LightbulbIcon className="w-6 h-6 mr-2 text-yellow-400" />
                {title}
            </h2>
            {renderContent()}
        </div>
    );
};

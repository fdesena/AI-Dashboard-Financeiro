import React, { useState, FC } from 'react';
import { Transaction, View, CreditCardTransaction } from './types';
import { BanknoteIcon, LayoutDashboardIcon, CreditCardIcon } from './components/icons';
import { AccountDashboard } from './components/dashboard/AccountDashboard';
import { CardDashboard } from './components/dashboard/CardDashboard';


// --- Main App Component ---
const App: FC = () => {
    const [view, setView] = useState<View>('account');
    
    // State for Account Dashboard
    const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
    const [processedAccountFiles, setProcessedAccountFiles] = useState<string[]>([]);
    
    // State for Card Dashboard
    const [cardTransactions, setCardTransactions] = useState<CreditCardTransaction[]>([]);
    const [processedCardFiles, setProcessedCardFiles] = useState<string[]>([]);

    const renderView = () => {
        if (view === 'account') {
            return <AccountDashboard 
                transactions={accountTransactions} 
                setTransactions={setAccountTransactions}
                processedFiles={processedAccountFiles} 
                setProcessedFiles={setProcessedAccountFiles}
            />;
        }
        if (view === 'card') {
            return <CardDashboard 
                transactions={cardTransactions} 
                setTransactions={setCardTransactions}
                processedFiles={processedCardFiles} 
                setProcessedFiles={setProcessedCardFiles}
            />;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <BanknoteIcon className="h-8 w-8 text-sky-500" />
                            <h1 className="text-2xl font-bold ml-3 text-white">Dashboard Financeiro IA</h1>
                        </div>
                        <nav className="flex space-x-2 bg-gray-700 p-1 rounded-lg">
                           <button onClick={() => setView('account')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'account' ? 'bg-sky-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'}`}>
                                <LayoutDashboardIcon className="w-5 h-5"/> Dashboard da Conta
                            </button>
                             <button onClick={() => setView('card')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'card' ? 'bg-sky-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'}`}>
                                <CreditCardIcon className="w-5 h-5"/> Análise de Cartão
                            </button>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {renderView()}
            </main>
        </div>
    );
};
export default App;
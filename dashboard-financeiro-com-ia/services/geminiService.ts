
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData, CreditCardAnalysisData } from "../types";
import { formatCurrency } from "../utils/helpers";

// Ensure the API key is available as an environment variable
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const ACCOUNT_CATEGORIES = [
    'Alimentação', 'Transporte', 'Moradia', 'Compras', 'Lazer & Hobbies', 
    'Saúde & Bem-estar', 'Educação', 'Serviços & Contas', 'Salário & Renda', 
    'Investimentos', 'Viagens', 'Presentes & Doações', 'Outras Despesas', 'Outras Receitas'
];

export const CREDIT_CARD_CATEGORIES = [
    'Restaurante', 'Mercado', 'Cafeteria', 'Alimentação',
    'Transporte', 'Uber', 'Viagem',
    'Compras', 'Roupas e acessórios',
    'Lazer', 'Hobbies', 'Salão de beleza', 'Academia', 'Subscrições',
    'Saúde & Bem-estar', 'Seguro Saúde',
    'Moradia', 'Aluguel', 'Serviços',
    'Educação',
    'Presentes & Doações',
    'Miscellaneous'
];

export const categorizeTransactions = async (descriptions: string[]): Promise<string[]> => {
    try {
        const prompt = `
            Você é um assistente financeiro especialista em categorizar transações de extratos bancários.
            Analise cada uma das seguintes descrições de transação e atribua a categoria mais apropriada da lista fornecida.

            Lista de Categorias Válidas:
            ${ACCOUNT_CATEGORIES.join(', ')}

            Descrições das Transações para Analisar:
            ${JSON.stringify(descriptions)}

            Responda com um array JSON, onde cada elemento é a string da categoria correspondente para cada descrição, na mesma ordem em que foram fornecidas.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        enum: ACCOUNT_CATEGORIES,
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const categories = JSON.parse(jsonText);

        if (Array.isArray(categories) && categories.length === descriptions.length) {
            return categories;
        } else {
            console.error("A resposta da IA não corresponde ao formato esperado:", categories);
            return descriptions.map(() => 'Outras Despesas');
        }

    } catch (error) {
        console.error("Erro ao categorizar transações com Gemini:", error);
        return descriptions.map(() => 'Outras Despesas');
    }
};


export const categorizeCreditCardTransactions = async (descriptions: string[]): Promise<string[]> => {
    try {
        const prompt = `
            Você é um assistente financeiro especialista em categorizar despesas de cartão de crédito.
            Analise cada uma das seguintes descrições de despesa e atribua a categoria mais apropriada da lista fornecida.

            Lista de Categorias Válidas:
            ${CREDIT_CARD_CATEGORIES.join(', ')}

            Descrições das Despesas para Analisar:
            ${JSON.stringify(descriptions)}

            Responda com um array JSON, onde cada elemento é a string da categoria correspondente para cada descrição, na mesma ordem em que foram fornecidas. Se nenhuma categoria for apropriada, use 'Miscellaneous'.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        enum: CREDIT_CARD_CATEGORIES,
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const categories = JSON.parse(jsonText);

        if (Array.isArray(categories) && categories.length === descriptions.length) {
            return categories;
        } else {
            console.error("A resposta da IA do cartão de crédito não corresponde ao formato esperado:", categories);
            return descriptions.map(() => 'Miscellaneous');
        }

    } catch (error) {
        console.error("Erro ao categorizar transações de cartão de crédito com Gemini:", error);
        return descriptions.map(() => 'Miscellaneous');
    }
};


export const generateAccountAnalysis = async (data: AnalysisData): Promise<string> => {
    const averageIncome = data.summary.incomeTransactionsCount && data.summary.incomeTransactionsCount > 0 ? data.summary.income / data.summary.incomeTransactionsCount : 0;
    const averageExpense = data.summary.expenseTransactionsCount && data.summary.expenseTransactionsCount > 0 ? data.summary.expenses / data.summary.expenseTransactionsCount : 0;

    const prompt = `
        Você é um analista financeiro especialista. Com base nos seguintes dados de uma conta, gere uma análise estruturada.
        A análise deve ser em português, clara, concisa e orientada à tomada de decisão.
        Use **markdown** para formatação e estruture a resposta exatamente em cinco seções com bullet points, como especificado abaixo. Não adicione parágrafos introdutórios ou de conclusão fora desta estrutura.

        **Dados Financeiros:**
        - **Resumo do Período:**
          - Receitas Totais: ${formatCurrency(data.summary.income)}
          - Despesas Totais: ${formatCurrency(data.summary.expenses)}
          - Saldo: ${formatCurrency(data.summary.balance)}
          - Total de Transações: ${data.summary.totalTransactionsCount || 0}
          - Média por Transação de Receita: ${formatCurrency(averageIncome)}
          - Média por Transação de Despesa: ${formatCurrency(Math.abs(averageExpense))}
        - **Comparativo com Período Anterior (por categoria):**
          ${data.comparisonData.map(c => `- ${c.name}: Atual ${formatCurrency(c.current)} vs. Anterior ${formatCurrency(c.previous)}`).join('\n')}
        - **Metas de Despesas (Planejado vs. Realizado):**
          ${data.goalsData.filter(g => g.planned > 0).map(g => `- ${g.name}: Planejado ${formatCurrency(g.planned)} vs. Realizado ${formatCurrency(g.realized)}`).join('\n') || 'Nenhuma meta de despesa definida.'}

        **Estrutura da Análise (use este formato exato):**

        ### 1. Resumo Geral
        *   Fale sobre o desempenho geral do período, mencionando o saldo final (positivo ou negativo) e a relação entre receitas e despesas.

        ### 2. Principais Destaques do Período
        *   Identifique as 2 ou 3 categorias de despesa com as maiores variações (aumento ou redução) em comparação com o período anterior.
        *   Mencione a categoria de receita com a maior variação, se relevante.

        ### 3. Pontos Positivos
        *   Destaque comportamentos financeiros saudáveis. Ex: redução de gastos em categorias não essenciais, alcance de metas de economia, ou aumento de receitas.
        *   Mencione se alguma meta de despesa foi batida com sucesso (gasto realizado menor que o planejado).

        ### 4. Pontos de Atenção
        *   Aponte desvios ou gastos inesperados. Ex: categorias onde os gastos ultrapassaram significativamente o planejado ou o histórico do período anterior.
        *   Mencione se alguma meta importante foi estourada.
        *   Se não houver metas definidas para as principais categorias de despesa, sugira a importância de criá-las.

        ### 5. Recomendações Práticas
        *   Forneça 2 ou 3 sugestões objetivas e acionáveis. Ex: "Considere criar uma meta para 'Alimentação', que representou 25% das suas despesas", "Revise os gastos com 'Compras', que aumentaram 40% este mês", ou "Parabéns pela economia em 'Transporte', continue assim".
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Erro ao gerar análise inteligente da conta:", error);
        return "Não foi possível gerar a análise. Tente novamente mais tarde.";
    }
};


export const generateCardAnalysis = async (data: CreditCardAnalysisData): Promise<string> => {
    const prompt = `
        Você é um analista financeiro especialista em faturas de cartão de crédito. Com base nos seguintes dados, gere uma análise estruturada.
        A análise deve ser em português, clara, concisa e orientada à tomada de decisão.
        Use **markdown** para formatação e estruture a resposta exatamente em cinco seções com bullet points, como especificado abaixo. Não adicione parágrafos introdutórios ou de conclusão fora desta estrutura.

        **Dados da Fatura:**
        - **Resumo do Período:**
            - Gasto Total: ${formatCurrency(data.summary.totalExpenses)}
            - Número de Transações: ${data.summary.transactionCount}
            - Gasto Médio por Transação: ${formatCurrency(data.summary.averageSpend)}
        - **Comparativo com Período Anterior (por categoria):**
            ${data.comparisonData.map(c => `- ${c.name}: Atual ${formatCurrency(c.current)} vs. Anterior ${formatCurrency(c.previous)}`).join('\n')}
        - **Metas de Despesas (Planejado vs. Realizado):**
            ${data.goalsData.filter(g => g.planned > 0).map(g => `- ${g.name}: Planejado ${formatCurrency(g.planned)} vs. Realizado ${formatCurrency(g.realized)}`).join('\n') || 'Nenhuma meta de despesa definida.'}

        **Estrutura da Análise (use este formato exato):**

        ### 1. Resumo Geral
        *   Apresente o valor total da fatura, o número de transações e o gasto médio por transação.

        ### 2. Principais Destaques do Período
        *   Identifique as 2 ou 3 categorias de despesa com os maiores aumentos em comparação com o período anterior.
        *   Se houver alguma redução significativa em alguma categoria, mencione também.

        ### 3. Pontos Positivos
        *   Destaque se os gastos totais diminuíram ou se alguma categoria importante teve uma redução considerável.
        *   Mencione se alguma meta de despesa foi batida com sucesso (gasto realizado menor que o planejado).

        ### 4. Pontos de Atenção
        *   Aponte as categorias onde os gastos ultrapassaram significativamente o planejado ou o histórico do período anterior.
        *   Mencione se o gasto médio por transação aumentou, indicando compras de maior valor.
        *   Se não houver metas definidas para as principais categorias de despesa, sugira a importância de criá-las.

        ### 5. Recomendações Práticas
        *   Forneça 2 ou 3 sugestões objetivas e acionáveis. Ex: "Foque em reduzir os gastos com 'Restaurante', que subiram 30%", "Crie uma meta para 'Compras', que foi sua maior despesa", ou "Parabéns por economizar em 'Transporte'".
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Erro ao gerar análise inteligente do cartão:", error);
        return "Não foi possível gerar a análise. Tente novamente mais tarde.";
    }
};
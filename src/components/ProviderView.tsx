import React from "react"; //importa a biblioteca base do react para criar o componente

interface ProviderViewProps { //define o contrato de informacoes que este componente precisa receber
    onBack: () => void; //diz que o obrigatoriamente recebe uma funcao para o botao "voltar"
} //fecha a definicao da interface

export function ProviderView ({ onBack }: ProviderViewProps){ //exporta a funcao e usa a desestruturacao para pegar a funcao 'onBack'
    return ( //inicia o que sera desenhadoi na tela do prestador
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Aqui vai o Header que vamos criar */}
            <main className="max-w-5xl mx-auto p-6">
                {/* Aqui vão os Cards de Estatísticas */}
                {/* Aqui vai a Lista de Agenda */}
            </main>
        </div>
    );
}
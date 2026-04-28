import React from "react";

interface ProviderViewProps {
    onBack: () => void;
}

export function ProviderView ({ onBack }: ProviderViewProps){
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Aqui vai o Header que vamos criar */}
            <main className="max-w-5xl mx-auto p-6">
                {/* Aqui vão os Cards de Estatísticas */}
                {/* Aqui vai a Lista de Agenda */}
            </main>
        </div>
    );
}
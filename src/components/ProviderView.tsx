import React, { useState, useEffect } from "react";
import { LogOut, Calendar, DollarSign, Star, Briefcase, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { StatCard } from "./StatCard";
 
interface Chamado {
    id: number;
    nome_cliente: string;
    descricao_servico: string;
    status: string;
    data_criacao: string;
}
 
interface ProviderViewProps {
    profissional: {
        id: number;
        nome: string;
        especialidade: string;
    } | null;
    onBack: () => void;
}
 
// Retorna ícone e cor de acordo com o status do chamado
function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'confirmado':
            return (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Confirmado
                </span>
            );
        case 'em_andamento':
            return (
                <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" /> Em andamento
                </span>
            );
        default: // 'pending' ou qualquer outro
            return (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3" /> Pendente
                </span>
            );
    }
}
 
export function ProviderView({ profissional, onBack }: ProviderViewProps) {
 
    const [chamados, setChamados] = useState<Chamado[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
 
    const nomeProfissional = profissional?.nome || "Profissional";
    const especialidade = profissional?.especialidade || "Prestador de Serviços";
 
    // Busca os chamados assim que o painel abre
    useEffect(() => {
        if (!profissional?.id) {
            setCarregando(false);
            return;
        }
 
        fetch(`http://localhost:5000/chamados/profissional/${profissional.id}`)
            .then(res => {
                if (!res.ok) throw new Error("Erro ao buscar chamados");
                return res.json();
            })
            .then(dados => {
                setChamados(dados);
                setCarregando(false);
            })
            .catch(err => {
                console.error("❌ Erro ao buscar chamados:", err);
                setErro("Não foi possível carregar seus chamados.");
                setCarregando(false);
            });
    }, [profissional?.id]); // Só reexecuta se o ID do profissional mudar
 
    return (
        <div className="provider-screen">
            {/* HEADER DO PAINEL */}
            <header className="provider-header">
                <div className="provider-header-container">
                    <div className="provider-brand">
                        <div className="provider-icon-wrapper">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="provider-title">Painel do Profissional</h1>
                            <p className="provider-subtitle">ServiConnect Pró</p>
                        </div>
                    </div>
 
                    <button onClick={onBack} className="btn-logout">
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </header>
 
            {/* CONTEÚDO PRINCIPAL */}
            <main className="provider-main-container">
 
                {/* SAUDAÇÃO */}
                <div className="provider-welcome-box">
                    <h2 className="provider-welcome-title">Olá, {nomeProfissional}!</h2>
                    <p className="provider-welcome-subtitle">{especialidade} • Assis-SP</p>
                </div>
 
                {/* CARDS DE ESTATÍSTICAS */}
                <div className="provider-stats-grid">
                    <StatCard
                        label="Serviços Agendados"
                        value={carregando ? "..." : String(chamados.length)}
                        icon={<Calendar className="w-6 h-6 text-indigo-600" />}
                        colorClass="bg-indigo-50"
                    />
                    <StatCard
                        label="Previsão de Ganhos"
                        value="A combinar"
                        icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
                        colorClass="bg-emerald-50"
                    />
                    <StatCard
                        label="Sua Avaliação"
                        value="4.9"
                        icon={<Star className="w-6 h-6 text-amber-500 fill-current" />}
                        colorClass="bg-amber-50"
                    />
                </div>
 
                {/* SEÇÃO DA AGENDA / CHAMADOS */}
                <div className="provider-agenda-card">
                    <h3 className="provider-agenda-title">Seus Próximos Serviços</h3>
 
                    {/* Estado: carregando */}
                    {carregando && (
                        <div className="provider-agenda-empty">
                            <p className="provider-agenda-empty-text animate-pulse">Buscando seus chamados...</p>
                        </div>
                    )}
 
                    {/* Estado: erro na requisição */}
                    {!carregando && erro && (
                        <div className="provider-agenda-empty">
                            <AlertCircle className="provider-agenda-empty-icon text-rose-400" />
                            <p className="provider-agenda-empty-text text-rose-400">{erro}</p>
                        </div>
                    )}
 
                    {/* Estado: sem chamados */}
                    {!carregando && !erro && chamados.length === 0 && (
                        <div className="provider-agenda-empty">
                            <Calendar className="provider-agenda-empty-icon" />
                            <p className="provider-agenda-empty-text">Nenhum agendamento confirmado para hoje.</p>
                            <p className="provider-agenda-empty-subtext">Quando um cliente solicitar orçamento, aparecerá aqui.</p>
                        </div>
                    )}
 
                    {/* Estado: lista de chamados */}
                    {!carregando && !erro && chamados.length > 0 && (
                        <div className="space-y-3">
                            {chamados.map(chamado => (
                                <div key={chamado.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-slate-800 text-sm">{chamado.nome_cliente}</span>
                                        <span className="text-xs text-slate-500">{chamado.descricao_servico}</span>
                                        <span className="text-xs text-slate-400 mt-1">
                                            {new Date(chamado.data_criacao).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <StatusBadge status={chamado.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
 
            </main>
        </div>
    );
}
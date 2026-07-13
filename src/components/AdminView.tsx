import React, { useState } from 'react';
import { Shield, Users, Calendar, LogOut, Wrench, FileText } from 'lucide-react';
import { StatCard } from './StatCard'; 

interface AdminViewProps {
  onBack: () => void;
}

export function AdminView({ onBack }: AdminViewProps) {
  // Estados fictícios com dados mocados que depois substituiremos pelas chamadas da API
  const [estatisticas] = useState({ profissionais: 12, chamados: 45 });
  const [chamados] = useState([
    { id: 1, nome_cliente: "Carlos Silva", descricao_servico: "Vazamento na pia da cozinha", status: "pending", data_criacao: "2026-07-12" },
    { id: 2, nome_cliente: "Ana Oliveira", descricao_servico: "Instalação de 3 tomadas 20A", status: "em_andamento", data_criacao: "2026-07-11" },
    { id: 3, nome_cliente: "Marcos Souza", descricao_servico: "Pintura de portão residencial", status: "confirmado", data_criacao: "2026-07-10" },
  ]);

  return (
    <div className="provider-screen">
      
      {/* HEADER / TOPO DA PÁGINA */}
      <header className="provider-header">
        <div className="provider-header-container">
          <div className="provider-brand">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="provider-title">Painel do Administrador</h1>
              <p className="provider-subtitle">ServiConnect Central</p>
            </div>
          </div>

          <button onClick={onBack} className="btn-logout">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DO DASHBOARD */}
      <main className="provider-main-container">
        
        {/* Bloco de Boas-vindas */}
        <div className="provider-welcome-box">
          <h2 className="provider-welcome-title">Bem-vindo, Administrador!</h2>
          <p className="provider-welcome-subtitle">Visão geral do sistema em Assis-SP</p>
        </div>

        {/* GRID DE CARDS COM AS ESTATÍSTICAS GLOBAIS */}
        <div className="provider-stats-grid">
          <StatCard
            label="Profissionais Cadastrados"
            value={String(estatisticas.profissionais)}
            icon={<Users className="w-6 h-6 text-indigo-600" />}
            colorClass="bg-indigo-50"
          />
          <StatCard
            label="Total de Chamados"
            value={String(estatisticas.chamados)}
            icon={<Calendar className="w-6 h-6 text-emerald-600" />}
            colorClass="bg-emerald-50"
          />
          <StatCard
            label="Status do Sistema"
            value="Ativo"
            icon={<Wrench className="w-6 h-6 text-amber-500" />}
            colorClass="bg-amber-50"
          />
        </div>

        {/* TABELA DE CONTROLE DE CHAMADOS */}
        <div className="provider-agenda-card">
          <h3 className="provider-agenda-title">Controle Geral de Ordens de Serviço</h3>

          <div className="space-y-3">
            {chamados.map(chamado => (
              <div key={chamado.id} className="admin-card-chamado">
                <div className="flex gap-4">
                  <div className="admin-icon-container">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-800 text-sm">Cliente: {chamado.nome_cliente}</span>
                    <span className="text-xs text-slate-500">{chamado.descricao_servico}</span>
                    <span className="text-xs text-slate-400 mt-1">
                      {new Date(chamado.data_criacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <span className={`admin-badge-status ${
                  chamado.status === 'confirmado' ? 'text-emerald-600 bg-emerald-50' :
                  chamado.status === 'em_andamento' ? 'text-indigo-600 bg-indigo-50' : 'text-amber-600 bg-amber-50'
                }`}>
                  {chamado.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
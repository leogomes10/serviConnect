import React, { useState } from 'react'; // Importa o React e o hook useState para gerenciar as telas
import { Search, Wrench, ArrowRight } from 'lucide-react'; // Importa os ícones para o visual do ServiConnect

export default function RoleSelection({ onSelect }: { onSelect: (role: number) => void }) {
  // Define qual tela aparece: 'selecao' (botões azuis) ou 'cadastro' (formulário)
  const [tela, setTela] = useState('selecao');

  // Objeto que guarda os dados digitados pelo profissional no cadastro
  const [cadastro, setCadastro] = useState({
    nome: '',
    categoria: '',
    preco: ''
  });

  // Função que lida com o envio do formulário
  const salvarCadastro = (e: React.FormEvent) => {
    e.preventDefault(); // Impede o navegador de recarregar a página ao enviar
    console.log("Dados salvos:", cadastro); // Mostra no console os dados para conferência
    alert("Cadastro realizado com sucesso!"); // Feedback visual rápido
    setTela('area_profissional'); // Muda a tela para o painel de boas-vindas
  };

  // --- TELA DE SELEÇÃO INICIAL (LAYOUT AZUL) ---
  if (tela === 'selecao') {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo ao ServiConnect</h1>
        <p className="text-indigo-100 mb-12">Serviços verificados e pagamento seguro em Assis.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Card para Clientes (Busca de serviços) */}
          <div 
             onClick={() => onSelect(1)} 
             className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-all"
            >
            <div className="bg-indigo-100 p-6 rounded-full mb-6">
              <Search className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Preciso de um serviço</h2>
            <p className="text-slate-500 mb-6">Encontre profissionais em poucos cliques.</p>
          </div>

          {/* Card para Profissionais (Abre o formulário ao clicar) */}
          <button 
            onClick={() => setTela('cadastro')} // Troca o estado para mostrar o formulário
            className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center hover:scale-105 transition-transform"
          >
            <div className="bg-emerald-100 p-6 rounded-full mb-6">
              <Wrench className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sou um profissional</h2>
            <p className="text-slate-500">Gerencie sua agenda e aumente seus ganhos.</p>
          </button>
        </div>
      </div>
    );
  }

  // --- TELA DE FORMULÁRIO DE CADASTRO ---
  if (tela === 'cadastro') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Crie seu perfil profissional</h2>
          
          <form onSubmit={salvarCadastro} className="space-y-4">
            {/* Campo para o Nome do Profissional */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-200 rounded-xl outline-indigo-600"
                placeholder="Como seus clientes te verão?"
                // Atualiza apenas o campo 'nome' no objeto de estado
                onChange={(e) => setCadastro({...cadastro, nome: e.target.value})}
                required
              />
            </div>

            {/* Campo para a Categoria do serviço */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Especialidade (Categoria)</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-200 rounded-xl outline-indigo-600"
                placeholder="Ex: Elétrica, Pintura, Faxina"
                // Atualiza apenas o campo 'categoria'
                onChange={(e) => setCadastro({...cadastro, categoria: e.target.value})}
                required
              />
            </div>

            {/* Campo para o Valor do serviço */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Estimado (R$)</label>
              <input 
                type="number" 
                className="w-full p-3 border border-slate-200 rounded-xl outline-indigo-600"
                placeholder="Valor base por serviço"
                // Atualiza apenas o campo 'preco'
                onChange={(e) => setCadastro({...cadastro, preco: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700">
              Finalizar Cadastro <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Botão de Cancelar/Voltar */}
          <button onClick={() => setTela('selecao')} className="w-full mt-4 text-slate-500 text-sm hover:underline">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // --- TELA DE SUCESSO / ÁREA DO PROFISSIONAL ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
      <h1 className="text-3xl font-bold text-slate-900">Painel do Profissional</h1>
      <p className="text-slate-600 mt-2 text-lg">Bem-vindo ao time, <span className="font-bold text-indigo-600">{cadastro.nome}</span>!</p>
      <p className="text-slate-500">Seu cadastro em <span className="italic">{cadastro.categoria}</span> foi registrado.</p>
      <button 
        onClick={() => setTela('selecao')} 
        className="mt-8 px-6 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
      >
        Sair / Voltar ao Início
      </button>
    </div>
  );
}
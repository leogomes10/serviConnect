import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Wrench, Zap, Droplets, Paintbrush, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service, Profissional } from '../types';

interface CustomerViewProps {
  services: Service[]; 
  loading: boolean; 
  searchTerm: string; 
  setSearchTerm: (value: string) => void; 
  onBack: () => void; 
}

export function CustomerView({ 
  loading: loadingProp, 
  searchTerm, 
  setSearchTerm, 
  onBack 
}: CustomerViewProps) { 

  const [listaProfissionais, setListaProfissionais] = useState<Profissional[]>([]);
  const [carregandoInterno, setCarregandoInterno] = useState(true);
  
  // Estado para controlar a abertura/fechamento do Modal de Solicitação
  const [modalAberto, setModalAberto] = useState(false);

  // Estados dos campos do formulário do cliente
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [especialidadeServico, setEspecialidadeServico] = useState('Pintura');
  const [descricaoServico, setDescricaoServico] = useState('');
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  // Busca a lista de profissionais cadastrados
  useEffect(() => {
    fetch('http://192.168.1.12:5000/profissionais')
      .then(res => res.json())
      .then(dados => {
        console.log("DADOS QUE CHEGARAM DO BANCO:", dados);
        setListaProfissionais(dados);
        setCarregandoInterno(false);
      })
      .catch(err => {
        console.error("Erro ao buscar profissionais:", err);
        setCarregandoInterno(false);
      });
  }, []);

  // Filtra a lista baseada no que o cliente digita na barra de busca
  const profissionaisFiltrados = listaProfissionais.filter((p: any) => 
    p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.especialidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (categoria: string) => { 
    switch ((categoria || '').toLowerCase()) { 
      case 'elétrica': 
      case 'eletrica': return <Zap className="w-5 h-5 text-yellow-500" />; 
      case 'hidráulica': 
      case 'hidraulica': return <Droplets className="w-5 h-5 text-blue-500" />; 
      case 'pintura': return <Paintbrush className="w-5 h-5 text-purple-500" />; 
      default: return <Wrench className="w-5 h-5 text-gray-500" />; 
    }
  };

  // Função para enviar o pedido do cliente ao backend
  const handleCriarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoPedido(true);

    try {
      const response = await fetch('http://192.168.1.12:5000/pedidos-servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nome: nomeCliente,
          cliente_telefone: telefoneCliente,
          especialidade: especialidadeServico,
          descricao: descricaoServico,
          cidade: 'Assis',
        }),
      });

      if (response.ok) {
        alert('🎉 Pedido publicado com sucesso! Os profissionais de Assis entrarão em contato via WhatsApp.');
        setNomeCliente('');
        setTelefoneCliente('');
        setDescricaoServico('');
        setModalAberto(false);
      } else {
        alert('Erro ao publicar o pedido. Verifique as informações.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setEnviandoPedido(false);
    }
  };

  return (
    <>
      <header className="servi-header bg-white border-b border-slate-200">
        <div className="servi-container h-16 flex items-center justify-between px-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">ServiConnect</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setModalAberto(true)} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              Pedir Orçamento
            </button>
            <button onClick={onBack} className="text-sm font-bold text-slate-600 hover:text-indigo-600">
              Voltar
            </button>
          </div>
        </div>
      </header>

      <main className="servi-container py-8 px-4 max-w-6xl mx-auto">
        {/* Banner de Ação para o Cliente */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 md:p-8 mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Precisa de um orçamento presencial?</h2>
            <p className="text-indigo-100 text-sm md:text-base">
              Publique o que você precisa e receba o contato dos melhores profissionais de Assis diretamente no seu WhatsApp!
            </p>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="whitespace-nowrap bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition shadow"
          >
            Solicitar Orçamento Agora
          </button>
        </div>

        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-2 text-slate-900">
            Ou busque diretamente por profissionais
          </h2>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="O que você precisa hoje? Ex: Pintor, Eletricista..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {profissionaisFiltrados.map((profissional) => (
              <motion.div key={profissional.id} layout className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    {getCategoryIcon(profissional.especialidade)}
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-500" /> 4.9
                  </div>
                </div>
                
                <h4 className="text-lg font-bold mb-1 text-slate-900">{profissional.nome}</h4>
                <p className="text-sm text-slate-500 mb-4 capitalize">{profissional.especialidade}</p>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Atendimento</span>
                    <span className="text-sm font-bold text-slate-700">📍 Assis e Região</span>
                  </div>
                  <button 
                    onClick={() => setModalAberto(true)} 
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-sm px-4 py-2 rounded-lg transition"
                  >
                    Pedir Orçamento
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* MODAL DE SOLICITAÇÃO DE ORÇAMENTO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setModalAberto(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Solicitar Orçamento</h3>
            <p className="text-sm text-slate-500 mb-6">Descreva o serviço para os profissionais da sua região responderem.</p>

            <form onSubmit={handleCriarPedido} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Seu Nome:</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: João da Silva"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">WhatsApp/Telefone:</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: 18999998888"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={telefoneCliente}
                  onChange={(e) => setTelefoneCliente(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Categoria:</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={especialidadeServico}
                  onChange={(e) => setEspecialidadeServico(e.target.value)}
                >
                  <option value="Pintura">Pintura</option>
                  <option value="Eletrica">Elétrica</option>
                  <option value="Hidraulica">Hidráulica</option>
                  <option value="Marcenaria">Marcenaria</option>
                  <option value="Limpeza">Limpeza / Diarista</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Descrição do Serviço:</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Ex: Preciso pintar uma sala de 4x4m e trocar 2 tomadas que pararam de funcionar."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  value={descricaoServico}
                  onChange={(e) => setDescricaoServico(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={enviandoPedido}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow"
                >
                  {enviandoPedido ? 'Enviando...' : 'Publicar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
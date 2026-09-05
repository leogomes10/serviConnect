import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Briefcase,
  Camera,
  Send
} from 'lucide-react';
import { Service } from '../types';

interface CustomerViewsProps {
  services: Service[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  onBack: () => void;
}

export default function CustomerView({
  services,
  loading,
  searchTerm,
  setSearchTerm,
  onBack
}: CustomerViewsProps) {
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<any | null>(null);
  const [modalOrcamentoAberto, setModalOrcamentoAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Estados do formulário de solicitação de orçamento
  const [formPedido, setFormPedido] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    especialidade: 'Pintor',
    foto_url: '',
    descricao: ''
  });

  const handleSubmitPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const response = await fetch('http://192.168.5.109:5000/pedidos-servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nome: formPedido.cliente_nome,
          cliente_telefone: formPedido.cliente_telefone,
          especialidade: formPedido.especialidade,
          foto_url: formPedido.foto_url,
          descricao: formPedido.descricao,
          cidade: 'Assis'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Seu pedido foi publicado! Os prestadores de Assis já podem visualizar no mural.');
        setFormPedido({
          cliente_nome: '',
          cliente_telefone: '',
          especialidade: 'Pintor',
          foto_url: '',
          descricao: ''
        });
        setModalOrcamentoAberto(false);
      } else {
        alert('Erro ao enviar pedido: ' + (data.erro || 'Falha no envio'));
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor. Verifique se a API está rodando.');
    } finally {
      setEnviando(false);
    }
  };

  const profissionaisFiltrados = (services || []).filter((prof: any) => {
    const nome = prof.nome?.toLowerCase() || '';
    const especialidade = prof.especialidade?.toLowerCase() || '';
    const termo = searchTerm.toLowerCase();
    return nome.includes(termo) || especialidade.includes(termo);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      
      {/* HEADER MOBILE RESPONSIVO */}
      <header className="sticky top-0 z-30 bg-[#f15a24] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="p-1.5 -ml-1 rounded-full hover:bg-black/10 active:scale-95 transition cursor-pointer"
          title="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-extrabold tracking-tight">ServiConnect</h1>

        <button 
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-bold py-1.5 px-3 rounded-full border border-white/30 backdrop-blur-sm transition cursor-pointer"
        >
          Início
        </button>
      </header>

      {/* BANNER PRINCIPAL LARANJA */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-[#f15a24] to-[#ce4d17] rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
          <h2 className="text-xl font-black mb-2 leading-tight">
            Precisa de um orçamento presencial?
          </h2>
          <p className="text-orange-100 text-xs mb-4 leading-relaxed">
            Receba o contato direto dos melhores prestadores avaliados de Assis.
          </p>
          <button 
            onClick={() => setModalOrcamentoAberto(true)}
            className="w-full bg-white text-[#ce4d17] font-extrabold py-3 px-4 rounded-xl text-sm shadow-md active:scale-98 transition flex items-center justify-center cursor-pointer"
          >
            Solicitar Orçamento Geral
          </button>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="px-4 mb-5">
        <h3 className="text-lg font-extrabold text-slate-900 mb-2">
          Buscar profissionais
        </h3>
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Ex: Pintor, Eletricista, Encanador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15a24] shadow-sm"
          />
        </div>
      </div>

      {/* LISTAGEM DE PROFISSIONAIS */}
      <div className="px-4 space-y-3.5">
        {loading ? (
          <p className="text-center py-8 text-slate-400 text-sm">Carregando profissionais...</p>
        ) : profissionaisFiltrados.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm">Nenhum profissional cadastrado.</p>
        ) : (
          profissionaisFiltrados.map((prof: any) => (
            <div 
              key={prof.id}
              onClick={() => setProfissionalSelecionado(prof)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-orange-200 cursor-pointer active:scale-[0.99] transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                  {prof.foto_url ? (
                    <img 
                      src={prof.foto_url} 
                      alt={prof.nome} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-orange-100 shadow-inner" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-orange-100 text-[#f15a24] flex items-center justify-center font-bold text-lg border-2 border-orange-200">
                      {prof.nome?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base truncate">{prof.nome}</h4>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-black text-amber-700">4.9</span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#ce4d17] mb-1">{prof.especialidade}</p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Assis e Região</span>
                    <span className="mx-1">•</span>
                    <span className="text-slate-500 font-medium">
                      {prof.total_servicos || prof.servicos_realizados?.length || 0} feitos
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end">
                <span className="text-xs font-bold text-orange-600 hover:underline">
                  Ver portfólio e serviços realizados →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: FORMULÁRIO PARA SOLICITAR ORÇAMENTO (POSTAR O PROBLEMA) */}
      {modalOrcamentoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            
            <div className="p-4 bg-gradient-to-r from-[#f15a24] to-[#ce4d17] text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg leading-tight">Descreva o que você precisa</h3>
                <p className="text-xs text-orange-100">Profissionais qualificados de Assis entrarão em contato</p>
              </div>
              <button 
                onClick={() => setModalOrcamentoAberto(false)} 
                className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPedido} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seu Nome</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: João Silva" 
                  value={formPedido.cliente_nome}
                  onChange={(e) => setFormPedido({...formPedido, cliente_nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15a24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seu WhatsApp / Telefone</label>
                <input 
                  type="tel" 
                  required
                  placeholder="Ex: (18) 99999-9999" 
                  value={formPedido.cliente_telefone}
                  onChange={(e) => setFormPedido({...formPedido, cliente_telefone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15a24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Profissional</label>
                <select 
                  value={formPedido.especialidade}
                  onChange={(e) => setFormPedido({...formPedido, especialidade: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15a24]"
                >
                  <option value="Pintor">Pintor</option>
                  <option value="Eletricista">Eletricista</option>
                  <option value="Encanador">Encanador</option>
                  <option value="Pedreiro">Pedreiro</option>
                  <option value="Marceneiro">Marceneiro</option>
                  <option value="Ar Condicionado">Ar Condicionado</option>
                  <option value="Geral">Outros / Serviços Gerais</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-orange-600" /> Foto do Problema (Link / Imagem)
                </label>
                <input 
                  type="url" 
                  placeholder="https://exemplo.com/foto-parede.jpg" 
                  value={formPedido.foto_url}
                  onChange={(e) => setFormPedido({...formPedido, foto_url: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15a24]"
                />
                <span className="text-[11px] text-slate-400">Opcional: cole o link de uma imagem para os prestadores verem.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descreva o Problema</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Ex: Preciso pintar uma sala de 20m² e passar massa corrida em uma parede que está descascando..."
                  value={formPedido.descricao}
                  onChange={(e) => setFormPedido({...formPedido, descricao: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f15a24]"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-[#f15a24] hover:bg-[#ce4d17] active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {enviando ? 'Publicando...' : 'Postar Pedido para Prestadores'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: DETALHES E PORTFÓLIO DO PROFISSIONAL */}
      {profissionalSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            
            <div className="p-4 bg-gradient-to-r from-[#f15a24] to-[#ce4d17] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profissionalSelecionado.foto_url ? (
                  <img 
                    src={profissionalSelecionado.foto_url} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white text-[#f15a24] flex items-center justify-center font-bold">
                    {profissionalSelecionado.nome?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-lg leading-snug">{profissionalSelecionado.nome}</h3>
                  <p className="text-xs text-orange-100 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Profissional Verificado em Assis
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setProfissionalSelecionado(null)} 
                className="p-1 rounded-full bg-black/20 hover:bg-black/30 active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs bg-orange-50 p-3 rounded-2xl border border-orange-100">
                <span className="font-medium text-slate-600">Total de trabalhos registrados:</span>
                <span className="font-bold text-[#ce4d17] text-sm">
                  {profissionalSelecionado.total_servicos || profissionalSelecionado.servicos_realizados?.length || 0} concluídos
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#f15a24]" />
                  Serviços já realizados
                </h4>

                <div className="space-y-3">
                  {profissionalSelecionado.servicos_realizados && profissionalSelecionado.servicos_realizados.length > 0 ? (
                    profissionalSelecionado.servicos_realizados.map((serv: any, index: number) => (
                      <div key={serv.id || index} className="border border-slate-100 rounded-2xl p-3 bg-slate-50">
                        {serv.imagemUrl && (
                          <img 
                            src={serv.imagemUrl} 
                            alt={serv.titulo} 
                            className="w-full h-36 object-cover rounded-xl mb-2"
                          />
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-sm">{serv.titulo}</span>
                          {serv.data && <span className="text-[11px] text-slate-400">{serv.data}</span>}
                        </div>
                        {serv.descricao && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{serv.descricao}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs text-slate-400">Nenhum serviço anexado no portfólio ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <button 
                onClick={() => setProfissionalSelecionado(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl text-sm transition cursor-pointer"
              >
                Fechar Portfólio
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
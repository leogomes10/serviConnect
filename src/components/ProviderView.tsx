import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  PlusCircle, 
  MapPin, 
  Lock, 
  Phone, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  X,
  Copy,
  QrCode
} from 'lucide-react';

interface Pedido {
  id: number;
  cliente_nome: string;
  cliente_telefone?: string;
  especialidade: string;
  categoria?: string;
  descricao: string;
  cidade: string;
  custo_moedas?: number;
}

export default function ProviderView({
  profissional,
  onBack
}: {
  profissional: any;
  onBack: () => void;
}) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldoMoedas, setSaldoMoedas] = useState<number>(profissional?.saldo_moedas || 50);
  
  // Guarda os contatos desbloqueados neste login: { [pedidoId]: telefoneReal }
  const [leadsLiberados, setLeadsLiberados] = useState<{ [key: number]: string }>({});
  
  // Estados para o Modal de Recarga Pix
  const [modalRecarga, setModalRecarga] = useState(false);
  const [pacoteSelecionado, setPacoteSelecionado] = useState<{ moedas: number; valor: number } | null>(null);
  const [dadosPix, setDadosPix] = useState<{ id: number; codigoPix: string } | null>(null);
  const [processandoPix, setProcessandoPix] = useState(false);

  // 1. Carregar Mural de Pedidos do Backend
  const carregarPedidos = async () => {
    try {
      const res = await fetch('http://192.168.5.109:5000/pedidos-servico');
      if (res.ok) {
        const data = await res.json();
        setPedidos(data);
      }
    } catch (err) {
      console.error('Erro ao buscar oportunidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  // 2. Fluxo: Desbloquear Contato (Comprar Lead)
  const handleDesbloquearLead = async (pedido: Pedido) => {
    const custo = pedido.custo_moedas || 15;

    if (saldoMoedas < custo) {
      alert(`Você precisa de ${custo} moedas para desbloquear este contato. Seu saldo atual é ${saldoMoedas}.`);
      setModalRecarga(true);
      return;
    }

    const confirmar = window.confirm(
      `Deseja usar ${custo} moedas para revelar o contato de ${pedido.cliente_nome}?`
    );
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://192.168.5.109:5000/comprar-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pedido_id: pedido.id,
          custo_moedas: custo
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSaldoMoedas(data.novo_saldo);
        setLeadsLiberados(prev => ({
          ...prev,
          [pedido.id]: data.contato_cliente.cliente_telefone
        }));
        alert('Contato liberado com sucesso!');
      } else {
        alert(data.erro || 'Não foi possível liberar o contato.');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor para comprar o lead.');
    }
  };

  // 3. Fluxo de Moedas: Gerar Pix
  const handleGerarPix = async (moedas: number, valor: number) => {
    setProcessandoPix(true);
    try {
      const res = await fetch('http://192.168.5.109:5000/gerar-pix-moedas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profissional_id: profissional.id,
          quantidade_moedas: moedas,
          valor_reais: valor
        })
      });

      const data = await res.json();
      if (res.ok) {
        setDadosPix({
          id: data.transacao.id,
          codigoPix: data.transacao.codigo_pix
        });
      } else {
        alert('Erro ao gerar código Pix.');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor.');
    } finally {
      setProcessandoPix(false);
    }
  };

  // 4. Fluxo de Moedas: Confirmar Pagamento Simulado
  const handleConfirmarPagamento = async () => {
    if (!dadosPix || !pacoteSelecionado) return;

    try {
      const res = await fetch('http://192.168.5.109:5000/confirmar-recarga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transacao_id: dadosPix.id,
          profissional_id: profissional.id,
          quantidade_moedas: pacoteSelecionado.moedas
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSaldoMoedas(data.profissional.saldo_moedas);
        alert(`Pagamento aprovado! +${pacoteSelecionado.moedas} moedas adicionadas à sua carteira.`);
        setModalRecarga(false);
        setDadosPix(null);
        setPacoteSelecionado(null);
      } else {
        alert('Erro ao confirmar recarga.');
      }
    } catch (error) {
      alert('Erro no processamento da confirmação.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-30 bg-[#f15a24] text-white px-4 py-3.5 shadow-md flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Sair / Trocar Perfil
        </button>

        <span className="font-extrabold text-sm tracking-wide">Painel do Profissional</span>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-5">
        
        {/* CARD DA CARTEIRA & BOAS-VINDAS */}
        <div className="bg-gradient-to-br from-[#f15a24] to-[#ce4d17] rounded-3xl p-5 text-white shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-200 uppercase font-semibold tracking-wider">Bem-vindo(a)</p>
              <h2 className="text-2xl font-black">{profissional?.nome || 'Profissional'}</h2>
              <span className="inline-block mt-0.5 bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {profissional?.especialidade || 'Prestador Verificado'}
              </span>
            </div>

            {/* Saldo de Moedas */}
            <div className="text-right bg-black/15 p-3 rounded-2xl border border-white/10">
              <span className="text-[11px] text-orange-200 block font-medium">Sua Carteira</span>
              <div className="flex items-center gap-1.5 justify-end mt-0.5">
                <Coins className="w-5 h-5 text-amber-300 fill-amber-400" />
                <span className="text-2xl font-black text-amber-300">{saldoMoedas}</span>
              </div>
              <span className="text-[10px] text-orange-100">moedas</span>
            </div>
          </div>

          {/* Botão de Recarga */}
          <button 
            onClick={() => {
              setDadosPix(null);
              setPacoteSelecionado(null);
              setModalRecarga(true);
            }}
            className="w-full bg-white text-[#ce4d17] hover:bg-orange-50 font-black py-3 px-4 rounded-2xl text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#ce4d17]" /> Recarregar Moedas com Pix
          </button>
        </div>

        {/* TÍTULO DO MURAL */}
        <div className="flex items-center justify-between pt-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Oportunidades em Assis e Região
          </h3>
          <span className="text-xs text-slate-500 font-bold bg-slate-200/80 px-2.5 py-0.5 rounded-full">
            {pedidos.length} disponíveis
          </span>
        </div>

        {/* LISTAGEM DE PEDIDOS / LEADS */}
        {loading ? (
          <p className="text-center py-10 text-slate-400 text-sm">Carregando oportunidades...</p>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/60 shadow-sm">
            <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Nenhum pedido aberto no momento.</p>
            <p className="text-xs text-slate-400 mt-1">Assim que um cliente solicitar um serviço em Assis, ele aparecerá aqui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const liberado = leadsLiberados[pedido.id] !== undefined;
              const telefoneExibido = liberado ? leadsLiberados[pedido.id] : pedido.cliente_telefone;
              const custo = pedido.custo_moedas || 15;

              return (
                <div 
                  key={pedido.id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:border-orange-200 transition space-y-4"
                >
                  {/* Topo do Pedido: Categoria e Cidade */}
                  <div className="flex items-center justify-between">
                    <span className="bg-orange-100/80 text-[#ce4d17] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {pedido.especialidade || pedido.categoria}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#f15a24]" />
                      <span>{pedido.cidade || 'Assis'}</span>
                    </div>
                  </div>

                  {/* Descrição da Necessidade */}
                  <p className="text-slate-800 text-sm font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    "{pedido.descricao}"
                  </p>

                  {/* Card do Cliente & Contato Protegido */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    liberado 
                      ? 'bg-emerald-50/60 border-emerald-200' 
                      : 'bg-orange-50/40 border-orange-100'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Cliente</span>
                        <p className="font-extrabold text-slate-900 text-sm">{pedido.cliente_nome}</p>
                      </div>

                      {/* Status de Liberação */}
                      {liberado ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Liberado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Contato Protegido
                        </span>
                      )}
                    </div>

                    {/* BOTÃO DE AÇÃO: SE LIBERADO -> WHATSAPP | SE BLOQUEADO -> DESBLOQUEAR */}
                    {liberado ? (
                      <a
                        href={`https://wa.me/55${telefoneExibido?.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(pedido.cliente_nome)},%20vi%20seu%20pedido%20no%20ServiConnect!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
                      >
                        <Phone className="w-4 h-4 fill-white" />
                        Chamar no WhatsApp ({telefoneExibido})
                      </a>
                    ) : (
                      <button
                        onClick={() => handleDesbloquearLead(pedido)}
                        className="w-full bg-[#f15a24] hover:bg-[#ce4d17] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Liberar Contato • <Coins className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> {custo} Moedas
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* MODAL DE RECARGA DE MOEDAS VIA PIX */}
      {modalRecarga && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            
            {/* Cabeçalho do Modal */}
            <div className="p-4 bg-gradient-to-r from-[#f15a24] to-[#ce4d17] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-amber-300 fill-amber-300" />
                <h3 className="font-black text-lg">Comprar Moedas</h3>
              </div>
              <button 
                onClick={() => setModalRecarga(false)}
                className="p-1 rounded-full bg-black/20 hover:bg-black/30 active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-5 overflow-y-auto space-y-4">
              {!dadosPix ? (
                <>
                  <p className="text-xs text-slate-500 font-medium">
                    Escolha um pacote para desbloquear contatos de clientes diretamente:
                  </p>

                  <div className="space-y-2.5">
                    {[
                      { moedas: 30, valor: 19.90, desc: 'Ideal para 2 contatos' },
                      { moedas: 80, valor: 44.90, desc: 'Mais popular • 5 contatos', destaque: true },
                      { moedas: 200, valor: 99.90, desc: 'Melhor custo-benefício' },
                    ].map((pacote, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setPacoteSelecionado(pacote)}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                          pacoteSelecionado?.moedas === pacote.moedas
                            ? 'border-[#f15a24] bg-orange-50/50'
                            : 'border-slate-200 hover:border-orange-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-lg">{pacote.moedas} Moedas</span>
                            {pacote.destaque && (
                              <span className="bg-[#f15a24] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Destaque
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">{pacote.desc}</span>
                        </div>
                        <span className="font-extrabold text-[#ce4d17] text-base">
                          R$ {pacote.valor.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={!pacoteSelecionado || processandoPix}
                    onClick={() => handleGerarPix(pacoteSelecionado!.moedas, pacoteSelecionado!.valor)}
                    className="w-full mt-2 bg-[#f15a24] hover:bg-[#ce4d17] active:scale-98 text-white font-black py-3.5 px-4 rounded-2xl text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    {processandoPix ? 'Gerando Pix...' : 'Pagar com Pix'}
                  </button>
                </>
              ) : (
                /* TELA COM O PIX COPIA E COLA */
                <div className="text-center space-y-4 py-2">
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Código Pix Gerado com Sucesso!
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[11px] text-slate-400 font-bold block uppercase mb-1">Código Pix Copia e Cola</span>
                    <p className="text-xs font-mono text-slate-600 break-all select-all p-2 bg-white rounded-lg border border-slate-200">
                      {dadosPix.codigoPix}
                    </p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(dadosPix.codigoPix);
                        alert('Código Pix copiado!');
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#f15a24] hover:underline"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar Código
                    </button>
                  </div>

                  {/* Botão de Simulação de Pagamento */}
                  <button
                    onClick={handleConfirmarPagamento}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-black py-3.5 px-4 rounded-2xl text-sm shadow-md transition cursor-pointer"
                  >
                    Confirmar Pagamento Simulado
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
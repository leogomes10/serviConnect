import React, { useState, useEffect } from 'react';

interface Pedido {
  id: number;
  especialidade: string;
  descricao: string;
  cidade: string;
  custo_moedas?: number;
  limite_respostas?: number;
  data_criacao?: string;
  cliente_nome?: string;
  cliente_telefone?: string;
}

interface ProviderViewProps {
  profissional: {
    id: number;
    nome: string;
    saldo_moedas?: number;
  } | null;
  onBack: () => void;
}

export const ProviderView: React.FC<ProviderViewProps> = ({ profissional, onBack }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');

  // --- ESTADOS PARA O MODAL DE RECARGA ---
  const [modalRecargaAberto, setModalRecargaAberto] = useState(false);
  const [passoRecarga, setPassoRecarga] = useState<'selecao' | 'pix'>('selecao');
  const [pacoteSelecionado, setPacoteSelecionado] = useState<{ moedas: number; valor: number } | null>(null);
  const [chavePix, setChavePix] = useState('');
  const [carregandoPix, setCarregandoPix] = useState(false);
  const [transacaoId, setTransacaoId] = useState<number | null>(null);

  const [saldoMoedas, setSaldoMoedas] = useState<number>(profissional?.saldo_moedas ?? 50);

  if (!profissional) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Acesso não autorizado ou sessão expirada.</p>
        <button onClick={onBack} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Voltar para o início
        </button>
      </div>
    );
  }

  // Busca os pedidos no backend
  useEffect(() => {
    const carregarPedidos = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://192.168.1.5:5000/pedidos-servico');
        if (res.ok) {
          const data = await res.json();
          setPedidos(data);
        }
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarPedidos();
  }, []);

  // Função de comprar lead (Atualizada com Token JWT)
  const handleComprarLead = async (idPedido: number, custoMoedas: number = 15) => {
    setMensagemErro('');

    if (saldoMoedas < custoMoedas) {
      alert('Saldo insuficiente de moedas! Recarregue sua carteira.');
      return;
    }

    try {
      const token = localStorage.getItem('@ServiConnect:token');

      const res = await fetch('http://192.168.1.5:5000/comprar-lead', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🔑 Token JWT enviado
        },
        body: JSON.stringify({
          pedido_id: idPedido,
          custo_moedas: custoMoedas
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensagemErro(data.erro || 'Erro ao desbloquear contato');
        return;
      }

      setSaldoMoedas(data.novo_saldo);

      setPedidos((prevPedidos) =>
        prevPedidos.map((p) =>
          p.id === idPedido
            ? { ...p, cliente_nome: data.contato_cliente.cliente_nome, cliente_telefone: data.contato_cliente.cliente_telefone }
            : p
        )
      );

      alert('Contato desbloqueado com sucesso!');
    } catch (err) {
      console.error('Erro na requisição:', err);
      setMensagemErro('Erro de conexão com o servidor.');
    }
  };

  // --- FUNÇÕES DA RECARGA VIA PIX ---
  const handleGerarPix = async (moedas: number, valor: number) => {
    setCarregandoPix(true);
    setPacoteSelecionado({ moedas, valor });

    try {
      const token = localStorage.getItem('@ServiConnect:token');

      const res = await fetch('http://192.168.1.5:5000/gerar-pix-moedas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🔑 Token JWT enviado
        },
        body: JSON.stringify({
          quantidade_moedas: moedas,
          valor_reais: valor
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setChavePix(data.codigo_pix);
        setTransacaoId(data.transacao_id);
        setPassoRecarga('pix');
      } else {
        alert(data.erro || 'Erro ao gerar cobrança PIX');
      }
    } catch (err) {
      console.error('Erro ao gerar PIX:', err);
      alert('Erro de conexão ao gerar o PIX.');
    } finally {
      setCarregandoPix(false);
    }
  };

  const handleConfirmarPagamento = async () => {
    if (!transacaoId) return;

    try {
      const token = localStorage.getItem('@ServiConnect:token');

      const res = await fetch('http://192.168.1.5:5000/confirmar-recarga', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🔑 Token JWT enviado
        },
        body: JSON.stringify({
          transacao_id: transacaoId,
          profissional_id: profissional.id
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`🎉 Pagamento confirmado! ${pacoteSelecionado?.moedas} moedas adicionadas à sua conta.`);
        setSaldoMoedas(data.novo_saldo);
        fecharModalRecarga();
      } else {
        alert(data.erro || 'Erro ao confirmar pagamento.');
      }
    } catch (err) {
      console.error('Erro ao confirmar pagamento:', err);
      alert('Erro de conexão ao confirmar pagamento.');
    }
  };

  const fecharModalRecarga = () => {
    setModalRecargaAberto(false);
    setPassoRecarga('selecao');
    setPacoteSelecionado(null);
    setChavePix('');
    setTransacaoId(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={onBack}
        style={{ 
          marginBottom: '15px', 
          background: 'none', 
          border: 'none', 
          color: '#2563eb', 
          cursor: 'pointer', 
          fontWeight: 'bold' 
        }}
      >
        ← Sair / Voltar
      </button>

      {/* Banner de Carteira */}
      <div
        style={{
          background: '#2563eb',
          color: '#fff',
          padding: '16px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Olá, {profissional.nome}</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Mural de Oportunidades</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Sua Carteira</span>
          <h2 style={{ margin: '0 0 6px 0', color: '#facc15' }}>🪙 {saldoMoedas} moedas</h2>
          <button
            onClick={() => setModalRecargaAberto(true)}
            style={{
              background: '#facc15',
              color: '#1e3a8a',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            + Recarregar Moedas
          </button>
        </div>
      </div>

      {mensagemErro && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
          {mensagemErro}
        </div>
      )}

      <h3>Oportunidades em Assis e Região</h3>

      {loading ? (
        <p>Carregando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p>Nenhum pedido de serviço aberto no momento.</p>
      ) : (
        pedidos.map((pedido) => (
          <div
            key={pedido.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }}
              >
                {pedido.especialidade}
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>📍 {pedido.cidade}</span>
            </div>

            <p style={{ color: '#374151', margin: '12px 0' }}>{pedido.descricao}</p>

            {pedido.cliente_telefone ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '12px',
                }}
              >
                <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#166534' }}>
                  👤 Cliente: {pedido.cliente_nome}
                </p>
                <a
                  href={`https://wa.me/55${pedido.cliente_telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#22c55e',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  💬 Chamar no WhatsApp ({pedido.cliente_telefone})
                </a>
              </div>
            ) : (
              <button
                onClick={() => handleComprarLead(pedido.id, pedido.custo_moedas || 15)}
                style={{
                  width: '100%',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                🔓 Desbloquear Contato por {pedido.custo_moedas || 15} moedas
              </button>
            )}
          </div>
        ))
      )}

      {/* MODAL DE RECARGA DE MOEDAS */}
      {modalRecargaAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '450px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={fecharModalRecarga}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              ✕
            </button>

            {passoRecarga === 'selecao' ? (
              <>
                <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>Comprar Moedas</h3>
                <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>
                  Escolha um pacote para liberar contatos de clientes no mural.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Pacote 1 */}
                  <div
                    onClick={() => handleGerarPix(30, 15)}
                    style={{
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: '0.2s',
                      opacity: carregandoPix ? 0.6 : 1
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>🪙 30 Moedas</h4>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Pacote Iniciante</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '16px' }}>R$ 15,00</span>
                  </div>

                  {/* Pacote 2 */}
                  <div
                    onClick={() => handleGerarPix(70, 30)}
                    style={{
                      border: '2px solid #2563eb',
                      background: '#eff6ff',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      opacity: carregandoPix ? 0.6 : 1
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '12px',
                      background: '#2563eb',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      MAIS VENDIDO
                    </span>
                    <div>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>🪙 70 Moedas</h4>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Pacote Profissional</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '16px' }}>R$ 30,00</span>
                  </div>

                  {/* Pacote 3 */}
                  <div
                    onClick={() => handleGerarPix(150, 60)}
                    style={{
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      opacity: carregandoPix ? 0.6 : 1
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>🪙 150 Moedas</h4>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Pacote Mestre</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '16px' }}>R$ 60,00</span>
                  </div>
                </div>

                {carregandoPix && (
                  <p style={{ textAlign: 'center', color: '#2563eb', marginTop: '15px', fontWeight: 'bold' }}>
                    Gerando chave PIX...
                  </p>
                )}
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>Pagamento via PIX</h3>
                <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>
                  Pacote: <strong>{pacoteSelecionado?.moedas} moedas</strong> (R$ {pacoteSelecionado?.valor.toFixed(2)})
                </p>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                    PIX Copia e Cola:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={chavePix}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '11px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      background: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(chavePix);
                      alert('Chave PIX copiada!');
                    }}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '8px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: '#334155'
                    }}
                  >
                    📋 Copiar Código PIX
                  </button>
                </div>

                <button
                  onClick={handleConfirmarPagamento}
                  style={{
                    width: '100%',
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✅ Confirmar Pagamento (Simular)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
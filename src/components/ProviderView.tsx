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

  // Busca os pedidos no backend (Corrigido IP .5)
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

  // Função de comprar lead (Corrigido IP .5 e chave profissional_id)
  const handleComprarLead = async (idPedido: number, custoMoedas: number = 15) => {
    setMensagemErro('');

    if (saldoMoedas < custoMoedas) {
      alert('Saldo insuficiente de moedas! Recarregue sua carteira.');
      return;
    }

    try {
      const res = await fetch('http://192.168.1.5:5000/comprar-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profissional_id: profissional.id,
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
          <h2 style={{ margin: 0, color: '#facc15' }}>🪙 {saldoMoedas} moedas</h2>
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
    </div>
  );
};
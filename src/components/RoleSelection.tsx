import React, { useState } from 'react'; //
import { Search, Wrench, ArrowRight } from 'lucide-react'; //

export default function RoleSelection({ onSelect }: { onSelect: (role: number) => void }) {
  const [tela, setTela] = useState('selecao'); // Controle de navegação interna
  const [cadastro, setCadastro] = useState({ // Objeto de cadastro conforme imagem image_2d26c0.jpg
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    categoria: '',
  });

  const salvarCadastro = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validação básica de senha que você já tem
  if (cadastro.senha !== cadastro.confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  try {
    // Envia os dados para a rota que você acabou de criar no server.ts
    const response = await fetch('http://localhost:5000/cadastro-profissional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: cadastro.nome,
        email: cadastro.email,
        senha: cadastro.senha,
        categoria: cadastro.categoria
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Cadastro realizado com sucesso!");
      setTela('login'); // Leva o usuário para a tela de login
    } else {
      alert("Erro: " + data.erro);
    }
  } catch (error) {
    console.error("Erro ao conectar com o servidor:", error);
    alert("O servidor está desligado ou houve um erro de conexão.");
  }
};

  // --- TELA DE LOGIN DO PROFISSIONAL ---
if (tela === 'login') {
  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">Acesse sua conta</h2>
        
        <form className="space-y-4">
          <div className="campo-grupo">
            <label className="label-serviconnect">E-mail</label>
            <input 
              type="email" 
              className="input-serviconnect" 
              placeholder="seu@email.com"
              required 
            />
          </div>

          <div className="campo-grupo">
            <label className="label-serviconnect">Senha</label>
            <input 
              type="password" 
              className="input-serviconnect" 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn-finalizar cursor-pointer">
            Entrar no ServiConnect
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500">Não tem uma conta? </span>
          <button 
            onClick={() => setTela('cadastro')} 
            className="text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            Criar conta
          </button>
        </div>

        <button onClick={() => setTela('selecao')} className="w-full mt-4 text-slate-400 text-xs hover:underline cursor-pointer">
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
    
  // --- TELA DE CADASTRO DO PROFISSIONAL ---
if (tela === 'cadastro') {
  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">Crie seu perfil profissional</h2>
        
        <form onSubmit={salvarCadastro} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nome completo" 
            className="input-serviconnect" 
            onChange={(e) => setCadastro({...cadastro, nome: e.target.value})} 
          />
          
          <input 
            type="email" 
            placeholder="E-mail" 
            className="input-serviconnect" 
            onChange={(e) => setCadastro({...cadastro, email: e.target.value})} 
          />

          <div className="grid grid-cols-2 gap-2">
            <input 
              type="password" 
              placeholder="Senha" 
              className="input-serviconnect" 
              onChange={(e) => setCadastro({...cadastro, senha: e.target.value})} 
            />
            <input 
              type="password" 
              placeholder="Confirmar" 
              className="input-serviconnect" 
              onChange={(e) => setCadastro({...cadastro, confirmarSenha: e.target.value})} 
            />
          </div>

          <input 
            type="text" 
            placeholder="Especialidade" 
            className="input-serviconnect" 
            onChange={(e) => setCadastro({...cadastro, categoria: e.target.value})} 
          />

          <button type="submit" className="btn-finalizar">
            Finalizar Cadastro <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <button onClick={() => setTela('selecao')} className="w-full mt-4 text-slate-500 text-sm hover:underline">
          Voltar
        </button>
      </div>
    </div>
  );
}

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
            onClick={() => setTela('login')} 
            className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform"
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
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">Crie seu perfil profissional</h2>
        
        <form onSubmit={salvarCadastro} className="space-y-4">
          
          {/* Campo para o Nome do Profissional */}
          <div className="campo-grupo">
            <label className="label-serviconnect">Nome Completo</label>
            <input 
              type="text" 
              className="input-serviconnect" 
              placeholder="Como seus clientes te verão?"
              onChange={(e) => setCadastro({...cadastro, nome: e.target.value})}
              required 
            />
          </div>

          {/* Campo para a Categoria do serviço */}
          <div className="campo-grupo">
            <label className="label-serviconnect">Especialidade (Categoria)</label>
            <input 
              type="text" 
              className="input-serviconnect" 
              placeholder="Ex: Elétrica, Pintura, Faxina"
              onChange={(e) => setCadastro({...cadastro, categoria: e.target.value})}
              required 
            />
          </div>


          <button type="submit" className="btn-finalizar">
            Finalizar Cadastro <ArrowRight className="w-5 h-5" />
          </button>
        </form>

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

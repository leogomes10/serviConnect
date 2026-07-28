import React, { useState } from 'react';
import { Search, Wrench, ArrowRight } from 'lucide-react';

export default function RoleSelection({ 
  onSelect, 
  onLoginSucesso 
}: { 
  onSelect: (role: number) => void,
  onLoginSucesso: (dados: any) => void 
}) {
  const [tela, setTela] = useState('selecao');
  
  // 1. ESTADOS PARA O LOGIN
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  const [cadastro, setCadastro] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    especialidade: '',
  });

  // 2. FUNÇÃO QUE CHAMA A ROTA DE LOGIN NO SERVER.TS (Corrigido para IP .5)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://192.168.1.5:5000/login-profissional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSucesso(data.profissional || data);
      } else {
        alert(data.erro || data.error || "Erro ao fazer login");
      }
    } catch (error) {
      alert("Servidor desligado ou erro de conexão.");
    }
  };

  // 3. FUNÇÃO DE CADASTRO (Corrigido rota /cadastrar-profissional e IP .5)
  const salvarCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cadastro.senha !== cadastro.confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const response = await fetch('http://192.168.1.5:5000/cadastrar-profissional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: cadastro.nome,
          email: cadastro.email,
          senha: cadastro.senha,
          especialidade: cadastro.especialidade
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Cadastro realizado com sucesso! Agora faça login.");
        setTela('login');
      } else {
        alert("Erro: " + (data.erro || data.error));
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    }
  };

  // --- TELA DE LOGIN DO PROFISSIONAL ---
  if (tela === 'login') {
    return (
      <div className="cadastro-container">
        <div className="cadastro-card">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">Acesse sua conta</h2>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="campo-grupo">
              <label className="label-serviconnect">E-mail</label>
              <input 
                type="email" 
                className="input-serviconnect" 
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required 
              />
            </div>

            <div className="campo-grupo">
              <label className="label-serviconnect">Senha</label>
              <input 
                type="password" 
                className="input-serviconnect" 
                placeholder="••••••••"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
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

  // --- TELA DE CADASTRO ---
  if (tela === 'cadastro') {
    return (
      <div className="cadastro-container">
        <div className="cadastro-card">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">Crie seu perfil profissional</h2>
          <form onSubmit={salvarCadastro} className="space-y-4">
            <input type="text" placeholder="Nome completo" className="input-serviconnect" required onChange={(e) => setCadastro({...cadastro, nome: e.target.value})} />
            <input type="email" placeholder="E-mail" className="input-serviconnect" required onChange={(e) => setCadastro({...cadastro, email: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input type="password" placeholder="Senha" className="input-serviconnect" required onChange={(e) => setCadastro({...cadastro, senha: e.target.value})} />
              <input type="password" placeholder="Confirmar" className="input-serviconnect" required onChange={(e) => setCadastro({...cadastro, confirmarSenha: e.target.value})} />
            </div>
            <input type="text" placeholder="Especialidade (Ex: Pintor, Eletricista)" className="input-serviconnect" required onChange={(e) => setCadastro({...cadastro, especialidade: e.target.value})} />
            <button type="submit" className="btn-finalizar">
              Finalizar Cadastro <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          <button onClick={() => setTela('login')} className="w-full mt-4 text-slate-500 text-sm hover:underline">Já tenho conta</button>
        </div>
      </div>
    );
  }

  // --- TELA DE SELEÇÃO INICIAL ---
  if (tela === 'selecao') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 relative"
        style={{
          backgroundColor: '#000c36',
          backgroundImage: 'url("/bg-pattern.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '260px'
        }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo ao ServiConnect</h1>
        <p className="text-indigo-100 mb-12">Serviços verificados e pagamento seguro em Assis.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* OPÇÃO: CLIENTE */}
          <div 
            onClick={() => onSelect(1)} 
            className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-all"
          >
            <div className="bg-indigo-100 p-6 rounded-full mb-6">
              <Search className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Preciso de um serviço</h2>
            <p className="text-slate-500">Encontre profissionais em poucos cliques.</p>
          </div>
          
          {/* OPÇÃO: PROFISSIONAL */}
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

        {/* BOTÃO DE ATALHO PARA O ADMINISTRADOR */}
        <button 
          onClick={() => onSelect(3)} 
          className="btn-atalho-admin"
          title="Painel de Controle do Admin"
        >
          <span>Painel Admin</span>
        </button>
      </div>
    );
  }
  return null;
}
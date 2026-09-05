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
    const response = await fetch('http://192.168.5.109:5000/login-profissional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
    });

    const data = await response.json();

    if (response.ok) {
      // SALVA O TOKEN JWT NO NAVEGADOR
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
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
      const response = await fetch('http://192.168.5.109:5000/cadastrar-profissional', {
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

  // --- TELA DE SELEÇÃO INICIAL MODERNA (MINIMALISTA E LARANJA) ---
  if (tela === 'selecao') {
    return (
      <div 
        className="min-h-screen flex flex-col justify-between items-center px-6 py-10 select-none bg-gradient-to-b from-[#f26d24] via-[#ee5922] to-[#c94212]"
      >
        {/* Título / Marca */}
        <div className="pt-6 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            ServiConnect
          </h1>
        </div>

        {/* Bloco Central: Apenas os 2 Botões */}
        <div className="flex flex-col gap-6 w-full max-w-sm my-auto">
          {/* BOTÃO 1: CONTRATAR */}
          <button 
            onClick={() => onSelect(1)}
            className="group relative flex items-center justify-between bg-gradient-to-r from-[#d8541a] to-[#ba3c0e] hover:brightness-110 active:scale-95 transition-all duration-200 rounded-3xl p-3 pr-6 shadow-xl border border-white/10 text-left overflow-visible"
          >
            {/* Personagem Cliente */}
            <div className="w-20 h-20 -my-3 flex-shrink-0 flex items-center justify-center">
              <img 
                src="/cliente-avatar.png" 
                alt="Cliente" 
                className="h-24 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform" 
              />
            </div>
            
            <span className="text-base font-black tracking-wide text-white uppercase text-center flex-1">
              Quero contratar um serviço!
            </span>
          </button>

          {/* BOTÃO 2: PROFISSIONAL */}
          <button 
            onClick={() => setTela('login')}
            className="group relative flex items-center justify-between bg-gradient-to-r from-[#d8541a] to-[#ba3c0e] hover:brightness-110 active:scale-95 transition-all duration-200 rounded-3xl p-3 pr-6 shadow-xl border border-white/10 text-left overflow-visible"
          >
            {/* Mascote Profissional */}
            <div className="w-20 h-20 -my-3 flex-shrink-0 flex items-center justify-center">
              <img 
                src="/profissional-mascote.png" 
                alt="Profissional" 
                className="h-24 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform" 
              />
            </div>

            <span className="text-base font-black tracking-wide text-white uppercase text-center flex-1">
              Sou um profissional!
            </span>
          </button>
        </div>

        {/* Rodapé sutil */}
        <div className="text-center text-xs text-orange-200/80 pb-2">
          <span>Versão 1.0.21 • Termos de privacidade</span>
        </div>
      </div>
    );
  }
  return null;
}
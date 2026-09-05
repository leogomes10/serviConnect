import { useState, useEffect } from 'react';
import { Service } from './types';
import RoleSelection from './components/RoleSelection';
import CustomerView from './components/CustomerViews';
import ProviderView from './components/ProviderView';
import { AdminView } from './components/AdminView';

export default function App() {
  // ESTADOS
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<number>(0); // 0 = início, 1 = cliente, 2 = prestador
  const [profissionalLogado, setProfissionalLogado] = useState<any>(null);

  // Função executada após o login bem-sucedido do prestador
  const handleLoginSucesso = (respostaLogin: any) => {
    // 1. Salva o token JWT para compras de leads e rotas autenticadas
    if (respostaLogin.token) {
      localStorage.setItem('token', respostaLogin.token);
    }

    // 2. Extrai o objeto do profissional (seja resposta direta ou aninhada)
    const dadosProfissional = respostaLogin.profissional || respostaLogin;
    setProfissionalLogado(dadosProfissional);

    // 3. Direciona para o painel do prestador
    setUserRole(2);
    console.log("Bem-vindo,", dadosProfissional.nome);
  };

  // Busca lista de prestadores cadastrados no backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://192.168.5.109:5000/profissionais');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
  // div principal: min-h-screen ocupa a tela toda, bg-slate-50 é o fundo cinza claro, font-sans é a fonte limpa
  <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
    {/*se o papel do usuario for 0 (inicio), desenha o componente de selecao de perfil */}
    {userRole === 0 && (
      <RoleSelection onSelect={setUserRole} //passa a funcao de mudar de cargo para dentro do botao
      onLoginSucesso={handleLoginSucesso} 
      /> 
    )}
    
    {/*se o papel for 1 (cliente), desenha a tela de busca dos profissionais*/}
    {userRole === 1 && ( 
      <CustomerView 
        services={services} // envia a lista de profissionais ao banco para a tela do cliente
        loading={loading} //envia o estado de carregamento
        searchTerm={searchTerm} //envia o que esta escrito na busca
        setSearchTerm={setSearchTerm} //envia a funcao para atualizar a busca conforme o cliente digita
        onBack={() => setUserRole(0)} //funcao para o botao "voltar" resetar o papel para 0
      />
    )}

    {/* se o papel for 2 (prestador), mostra o painel real que você já criou */}
      {userRole === 2 && ( 
        <ProviderView 
          profissional={profissionalLogado} 
          onBack={() => {
            setUserRole(0); 
            setProfissionalLogado(null); // Limpa o estado ao deslogar
          }} 
        />
      )}
      {/* se o papel for 3 (admin), mostra o painel de gerenciamento geral */}
       {userRole === 3 && (
         <AdminView 
           onBack={() => setUserRole(0)} // Reseta o papel e volta para a tela inicial
         />
         )}
    </div>
  );
}

 


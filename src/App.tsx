import { useState, useEffect } from 'react';
import { Wrench, Zap, Droplets, Paintbrush, Search, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from './types';
import RoleSelection from './components/RoleSelection';
import { CustomerView } from './components/CustomerViews';
import { ProviderView } from './components/ProviderView';
import { AdminView } from './components/AdminView';

export default function App() {
  // ESTADOS: Variaveis que o React monitora para atualizar a tela
  const [services, setServices] = useState<Service[]>([]); // Guarda a lista de profissionais no banco de dados
  const [loading, setLoading] = useState(true); // controla se a mensagem de "carregando" aparece
  const [searchTerm, setSearchTerm] = useState(''); // Guarda o texto da barra de busca
  const [userRole, setUserRole] = useState<number>(0); // 0=escolha, 1=cliente, 2=profissional
  const [profissionalLogado, setProfissionalLogado] = useState<any>(null);

  // Função executada quando o profissional faz login com sucesso
  const handleLoginSucesso = (respostaLogin: any) => {
    // 1. Salva o token JWT no localStorage se ele tiver vindo do backend
    if (respostaLogin.token) {
      localStorage.setItem('@ServiConnect:token', respostaLogin.token);
    }

    // 2. Define o profissional logado (pega o objeto do profissional ou a resposta completa)
    const dadosProfissional = respostaLogin.profissional || respostaLogin;
    setProfissionalLogado(dadosProfissional);

    // 3. Muda a tela para o Painel do Prestador (userRole = 2)
    setUserRole(2);

    console.log("Bem-vindo,", dadosProfissional.nome);
  };


  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://192.168.1.5:5000/profissionais'); // try "tente fazer isso", se a internet cair, ele pula para o cath
        const data = await response.json(); // transforma esse texto em um objeto javascript
        setServices(data); //atualiza a memoria do app com dados reais
      } catch (error) { // se algo der errado no "try", ele cai aqui
        console.error('Erro ao buscar serviços:', error); //mostra o erro no console do navegador para o dev
      } finally { //esse bloco roda SEMPRE, dando certo ou errado
        setLoading(false); //desliga o aviso de carregando, pois a tentativa de busca terminou
      }
    };
    fetchServices(); //chama a funcao que criamos acima para ela comecar a trabalhar
  }, []); //o[] vazio diz ao react: "só execute este useEffect uma vez, quando o app abrir"

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
      {userRole === 2 && ( /*[cite: 1] */
        <ProviderView 
          profissional={profissionalLogado} 
          onBack={() => {
            setUserRole(0); //[cite: 1]
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

 


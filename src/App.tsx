import { useState, useEffect } from 'react';
import { Wrench, Zap, Droplets, Paintbrush, Search, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from './types';
import { RoleSelection } from './components/RoleSelection';
import { CustomerView } from './components/CustomerViews';

export default function App() {
  // ESTADOS: Variaveis que o React monitora para atualizar a tela
  const [services, setServices] = useState<Service[]>([]); // Guarda a lista de profissionais no banco de dados
  const [loading, setLoading] = useState(true); // controla se a mensagem de "carregando" aparece
  const [searchTerm, setSearchTerm] = useState(''); // Guarda o texto da barra de busca
  const [userRole, setUserRole] = useState<number>(0); // 0=escolha, 1=cliente, 2=profissional

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/profissionais'); // try "tente fazer isso", se a internet cair, ele pula para o cath
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
      <RoleSelection onSelect={setUserRole} /> //passa a funcao de mudar de cargo para dentro do botao
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

    {/*se o papel for 2 (prestador), mostra o painel de gestao profissional*/}
    {userRole === 2 && (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Em breve: Painel do Profissional</h2>
        <button onClick={() => setUserRole(0)} className="text-indigo-600 font-bold mt-4">Voltar</button>
      </div>
    )}
  </div>
);}

 


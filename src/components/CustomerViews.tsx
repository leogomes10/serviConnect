import React from 'react';
import { Search, MapPin, Star, Wrench, Zap, Droplets, Paintbrush } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from '../types';

interface CustomerViewProps {
  services: Service[]; // Uma lista de profissionais que veio la do App.tsx
  loading: boolean; // O interruptor que diz se estamos esperando o banco de dados
  searchTerm: string; //o texto que o usuareio digitou na busca
  setSearchTerm: (value: string) => void; // A funcao para mudar este texto
  onBack: () => void; // a funcao para voltar a tela de inicio
}

export function CustomerView({ // exporta a funcao para ser usada em outros arquivos e inicia o componente
  services, //variavel que contem a lista de profissionais (vinda do banco de dados).
  loading,  //booleano que indica se o app esta buscando dados (true) ou se ja terminou (false)
  searchTerm, // string que guarda o que o usuario digitou na barra de pesquisa
  setSearchTerm, //funcao que atualiza o valor da busca la no componente pai (app.tsx)
  onBack // funcao que 'avisa' ao App.tsx para trocar a tela e voltar ao inicio
}: CustomerViewProps) { //fecha a desestruturacao e garante que todas as variaveis sigam o "contrato" de tipos

    const getCategoryIcon = (category: string) => { //cria a funcao que recebe o nome da categoria (texto) e devolve um icone
    switch ((category || '').toLowerCase()) { //inicia um 'escolha': garante que o texto nao seja nulo e trasforma em minusculo
      case 'elétrica': return <Zap className="w-5 h-5 text-yellow-500" />; //se for eletrica, retorna o icone de raio amarelo
      case 'hidráulica': return <Droplets className="w-5 h-5 text-blue-500" />; //se for hidraulica, retorna o icone de gotas azul
      case 'pintura': return <Paintbrush className="w-5 h-5 text-purple-500" />; //se for pintura, retorna o icone de pincel roxo
      default: return <Wrench className="w-5 h-5 text-gray-500" />; //se nao for nenhum desses padrao, retorna uma chave de fenda cinza
    }
  };
  
  const filteredServices = services.filter(s => { //cria uma nova lista filtrada percorrendo cada servico (s) da lista original
    const termo = searchTerm.toLowerCase(); //transforma o que o usuario digitou em letras minusculas para padronizar a busca.
    return s.nome?.toLowerCase().includes(termo) || s.servico?.toLowerCase().includes(termo); //verifica se o termo digitado esta no nome ou servico do profissional.
  });

  return ( //inicia o retorno  do que sera renderizado visualmente na tela
    <> {/*abre um fragment (uma tag vazia) para agrupar varios elementos sem criar uma div extra no HTML;}
      {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10"> {/*define o cabeçalho com fundo braco, borda inferior e fixo no topo (sticky) */ }
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"> {/*container que centraliza o conteudo e distribui os itens (logo a esquerda, botao a direita) */}
          <div className="flex items-center gap-2"> {/* agrupa o icone e o nome do app com um pequeno espaço (gap) entre eles */}
            <div className="bg-indigo-600 p-2 rounded-lg"> {/*quadrado roxo arredondado que serve de fundo para o icone */}
              <Wrench className="text-white w-6 h-6" /> {/*icone de chave de fenda branco centralizado no quadrado */}
            </div> {/*fecha o fundo do icone*/}
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ServiConnect</h1> {/*nome do aplicativo em negrito e cor escura*/}
          </div> {/*fecha o grupo do lado esquerdo (logo + nome)*/}
          <button onClick={onBack} className="text-sm font-bold text-indigo-600 hover:text-indigo-800"> {/*botao que executa a funcao de voltar ao ser clicado*/}
            Voltar {/*texto do botao*/}
          </button> {/*fecha a tag botao*/}
        </div> {/*fecha o container centralizador*/}
      </header> {/*fecha a tag do cabaçalho*/}

      <main className="max-w-7xl mx-auto px-4 py-8"> {/*define o conteudo principal, centralizado e com espaçamento nas laterais e no topo/fundo*/}
        <div className="mb-12 text-center max-w-2xl mx-auto"> {/*container centralizado para o titulo e a busca, limitando a largura para melhor leitura*/}
          <h2 className="text-4xl font-extrabold mb-4 text-slate-900 tracking-tight"> {/*titulo principal com fonte bem grande, negrito com letras levemente juntas(estilo moderno)*/}
            Encontre o profissional certo para sua casa. {/*texto de chamada para o usuario*/}
          </h2>
          <div className="relative group mt-8"> {/*cria um container relativo para permitir que o icone de lupa fique dentro do campo de texto*/}
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /> {/*icone de lupa posicionado de forma absoluta a esquerda e centralizado verticalmente*/}
            <input // Inicia a tag de entrada de texto (o campo de busca).
              type="text" // Define que o tipo de dado inserido será texto simples.
              placeholder="O que você precisa hoje? (Ex: Eletricista)" //Texto de dica que aparece quando o campo está vazio.
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg" // Estilização: largura total, espaço para o ícone (pl-12), bordas arredondadas e efeito azul ao clicar (focus).
              value={searchTerm} //Liga o valor do campo à variável 'searchTerm' (Estado controlado pelo React).
              onChange={(e) => setSearchTerm(e.target.value)} //Função que captura cada letra digitada e atualiza a busca instantaneamente.
            />
          </div> {/*Fecha a div do grupo de busca.*/}
        </div> {/*Fecha o container do cabeçalho da página.*/}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/*cria uma grade: 1 coluna (celular), 2 coluna (tablet) ou 3 coluna (PC)*/}
          <AnimatePresence mode="popLayout"> {/*permite que os itens animem suavemente ao entrar ou sair da lista*/}
            {loading ? ( //inicia o teste: se 'loading' for verdadeiro
              <p>Carregando profissionais em Assis...</p> //exibe esse texto enquanto os dados nao carregam
            ) : ( //caso contrario (se ja carregou)...
              filteredServices.map((service) => ( //inicia um loop que cria um card para cada profissional filtrado.
                <motion.div //tag de div com superpoderes de animacao do framer motion
                  key={service.id} //identificador unico obrigatorio do react para organizar lista
                  layout //faz com que os vizinhos deslizem suavemente quando um card some
                  initial={{ opacity: 0, y: 20 }} //estado inicial:invisivel e levemente abaixo da posicao
                  animate={{ opacity: 1, y: 0 }} //estado final: visivel e na posicao correta
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" //estilizacao visual do card (fundo, bordas e sombra).
                >
                  <div className="flex justify-between mb-4"> {/*alinha o icone a esquerda e a nota a direita;*/}
                    <div className="bg-slate-50 p-3 rounded-xl"> {/*moldura cinza claro para o icone da categoria*/}
                      {getCategoryIcon(service.servico)} {/*chama a funcao que escolhe o icone baseado no servico*/}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full"> {/*badge de avaliacao*/}
                      <Star className="w-3 h-3 fill-current" /> 4.9 {/*icone de estrela e nota fixa (por enquanto)*/}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold mb-1">{service.nome}</h4> {/*mostra o nome do profissional*/}
                  <p className="text-sm text-slate-500 mb-4">{service.servico}</p> {/*mostra o servico do profissional*/}
                  <div className="pt-4 border-t flex items-center justify-between">{/*linha divisoria e container para o rodape do card*/}
                    <span className="text-xl font-extrabold text-slate-900">R$ {service.valor_hora}</span> {/*exibe o preco formatado*/}
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold"> {/*botao de reserva roxo*/}
                      Reservar {/*texto do botao*/}
                    </button>
                  </div>
                </motion.div> //fecha o card animado
              )) //fecha o mapeamento da lista
            )}
          </AnimatePresence>{/*fecha o container de animacoes*/}
        </div>{/*fecha a grade principal*/}
      </main> {/*fecha a area de conteudo principal*/}
    </>
  );
}
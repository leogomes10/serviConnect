SelecaoDePapel.tsx (Original: RoleSelection.tsx): Tela inicial onde o usuário escolhe se é cliente ou profissional.


VisualizacaoCliente.tsx (Original: CustomerViews.tsx): Página onde os clientes buscam os prestadores de serviço em 
Assis.


VisualizacaoProfissional.tsx (Original: ProviderView.tsx): Painel de controle para quem presta os serviços.


CardDeStatus.tsx (Original: StatCard.tsx): Componente visual que mostra números ou estatísticas (ex: quantos serviços realizados).


App.tsx: Componente principal que centraliza a lógica de busca de dados na API, gerencia os estados globais da aplicação e controla a navegação entre as diferentes visualizações (telas) do projeto.


index.css: Arquivo central de estilização que utiliza Tailwind CSS para definir a identidade visual (fontes, cores e componentes). Ele organiza os estilos em camadas (Base e Components) para facilitar a manutenção e garantir a padronização visual de elementos como campos de entrada e cards de cadastro.


main.tsx: É o arquivo de entrada da aplicação. Sua função principal é conectar o código React ao documento HTML (DOM), renderizando o componente raiz (App.tsx) dentro da tag de destino. Ele também ativa ferramentas de diagnóstico do React e carrega os estilos globais do sistema.
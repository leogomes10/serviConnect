/* importa ferramentas de seguranca e renderizacao do react */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
/*importa o compomente raiz (maestro) e os estilos globais */
import App from './App.tsx';
import './index.css';

/* encontra a div 'root' no HTML e renderiza o nosso App dentro dela */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> {/* o coracao do projeto começa a bater aqui */}
  </StrictMode>,
);

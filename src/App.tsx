import { useState, useEffect } from 'react';
import { Wrench, Zap, Droplets, Paintbrush, Search, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from './types';

export default function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/profissionais');
        const data = await response.json();
        console.log("Dados carregados do banco:", data); // Verifique isso no F12
        setServices(data);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getCategoryIcon = (category: string) => {
  // O "category || ''" evita o erro se o valor vier nulo
  switch ((category || '').toLowerCase()) {
    case 'elétrica': return <Zap className="w-5 h-5 text-yellow-500" />;
    case 'hidráulica': return <Droplets className="w-5 h-5 text-blue-500" />;
    case 'pintura': return <Paintbrush className="w-5 h-5 text-purple-500" />;
    default: return <Wrench className="w-5 h-5 text-gray-500" />;
  }
};

  const filteredServices = services.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.servico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ServiConnect</h1>
          </div>
          
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#" className="text-indigo-600">Explorar</a>
            <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Meus Pedidos</a>
            <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Perfil</a>
          </nav>

          <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
            Entrar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section / Search */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4 text-slate-900 tracking-tight">
            Encontre o profissional certo para sua casa.
          </h2>
          <p className="text-slate-600 mb-8">
            Conectamos você com os melhores eletricistas, encanadores e pintores da sua região.
          </p>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="O que você precisa hoje? (Ex: Eletricista)"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Serviços Populares</h3>
            <span className="text-sm text-slate-500">{filteredServices.length} resultados encontrados</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg mb-4" />
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                    <div className="h-10 bg-slate-200 rounded w-full" />
                  </div>
                ))
              ) : filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <motion.div 
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-50 transition-colors">
                        {getCategoryIcon(service.servico)}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        4.9
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold mb-1 group-hover:text-indigo-600 transition-colors">{service.nome}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <span className="font-medium text-slate-700">{service.servico}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>A 2km de você</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block uppercase tracking-wider font-bold">A partir de</span>
                        <span className="text-xl font-extrabold text-slate-900">R$ {service.valor_hora}</span>
                      </div>
                      <button className="bg-white border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all">
                        Reservar
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-slate-400 italic">Nenhum serviço encontrado para "{searchTerm}"</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}


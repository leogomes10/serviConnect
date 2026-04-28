import React from 'react';
import { Search, MapPin, Star, Wrench, Zap, Droplets, Paintbrush } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from '../types';

interface CustomerViewProps {
  services: Service[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onBack: () => void;
}

export function CustomerView({ 
  services, 
  loading, 
  searchTerm, 
  setSearchTerm, 
  onBack 
}: CustomerViewProps) {

    const getCategoryIcon = (category: string) => {
    switch ((category || '').toLowerCase()) {
      case 'elétrica': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'hidráulica': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'pintura': return <Paintbrush className="w-5 h-5 text-purple-500" />;
      default: return <Wrench className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const filteredServices = services.filter(s => {
    const termo = searchTerm.toLowerCase();
    return s.nome?.toLowerCase().includes(termo) || s.servico?.toLowerCase().includes(termo);
  });

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ServiConnect</h1>
          </div>
          <button onClick={onBack} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
            Voltar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4 text-slate-900 tracking-tight">
            Encontre o profissional certo para sua casa.
          </h2>
          <div className="relative group mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="O que você precisa hoje? (Ex: Eletricista)"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <p>Carregando profissionais em Assis...</p>
            ) : (
              filteredServices.map((service) => (
                <motion.div 
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <div className="flex justify-between mb-4">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      {getCategoryIcon(service.servico)}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-current" /> 4.9
                    </div>
                  </div>
                  <h4 className="text-lg font-bold mb-1">{service.nome}</h4>
                  <p className="text-sm text-slate-500 mb-4">{service.servico}</p>
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-xl font-extrabold text-slate-900">R$ {service.valor_hora}</span>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                      Reservar
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
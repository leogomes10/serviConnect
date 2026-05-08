import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Wrench, Zap, Droplets, Paintbrush } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from '../types';
import { Profissional } from '../types';

interface CustomerViewProps {
  services: Service[]; 
  loading: boolean; 
  searchTerm: string; 
  setSearchTerm: (value: string) => void; 
  onBack: () => void; 
}

export function CustomerView({ 
  loading: loadingProp, // renomeei para não conflitar com o loading local
  searchTerm, 
  setSearchTerm, 
  onBack 
}: CustomerViewProps) { 

  const [listaProfissionais, setListaProfissionais] = useState<Profissional[]>([]);
  const [carregandoInterno, setCarregandoInterno] = useState(true);

  // Busca os dados diretamente da sua tabela de profissionais
  useEffect(() => {
    fetch("http://localhost:5000/profissionais")
      .then(res => res.json())
      .then(dados => {
        console.log("DADOS QUE CHEGARAM DO BANCO:", dados);
        setListaProfissionais(dados);
        setCarregandoInterno(false);
      })
      .catch(err => {
        console.error("Erro ao buscar profissionais:", err);
        setCarregandoInterno(false);
      });
  }, []);

  // Filtra a lista baseada no que você digita na busca
  const profissionaisFiltrados = listaProfissionais.filter((p: any) => 
    p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.especialidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (categoria: string) => { 
    switch ((categoria || '').toLowerCase()) { 
      case 'elétrica': return <Zap className="w-5 h-5 text-yellow-500" />; 
      case 'hidráulica': return <Droplets className="w-5 h-5 text-blue-500" />; 
      case 'pintura': return <Paintbrush className="w-5 h-5 text-purple-500" />; 
      default: return <Wrench className="w-5 h-5 text-gray-500" />; 
    }
  };

  return (
    <>
      <header className="servi-header">
        <div className="servi-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">ServiConnect</h1>
          </div>
          <button onClick={onBack} className="text-sm font-bold text-indigo-600">
            Voltar
          </button>
        </div>
      </header>

      <main className="servi-container py-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4 text-slate-900">
            Encontre o profissional certo para sua casa.
          </h2>
          <div className="relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="O que você precisa hoje?"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {profissionaisFiltrados.map((profissional) => (
              <motion.div key={profissional.id} layout className="profissional-card">
                <div className="flex justify-between mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    {getCategoryIcon(profissional.especialidade)}
                  </div>
                  <div className="badge-avaliacao">
                    <Star className="w-3 h-3 fill-current" /> 4.9
                  </div>
                </div>
                
                <h4 className="text-lg font-bold mb-1">{profissional.nome}</h4>
                <p className="text-sm text-slate-500 mb-4">{profissional.especialidade}</p>
                
                <div className="pt-4 border-t flex items-center justify-between">
                  <span className="text-xl font-extrabold text-slate-900">
                    R$ {profissional.preco || '0.00'}
                  </span>
                  <button className="btn-reservar">
                    Reservar
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
import { Search, Wrench } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: number) => void;
}

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-indigo-600 w-full">
      <div className="text-center mb-12 text-white">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Bem-vindo ao ServiConnect</h1>
        <p className="text-xl opacity-90 text-indigo-100">Serviços verificados e pagamento seguro em Assis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <button 
          onClick={() => onSelect(1)}
          className="bg-white p-8 rounded-3xl shadow-xl hover:scale-105 transition-transform flex flex-col items-center text-center group"
        >
          <div className="bg-indigo-100 p-6 rounded-full mb-6 group-hover:bg-indigo-600 transition-colors">
            <Search className="w-12 h-12 text-indigo-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Preciso de um serviço</h2>
          <p className="text-slate-500">Encontre profissionais em poucos cliques.</p>
        </button>

        <button 
          onClick={() => onSelect(2)}
          className="bg-white p-8 rounded-3xl shadow-xl hover:scale-105 transition-transform flex flex-col items-center text-center group"
        >
          <div className="bg-green-100 p-6 rounded-full mb-6 group-hover:bg-green-600 transition-colors">
            <Wrench className="w-12 h-12 text-green-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Sou um profissional</h2>
          <p className="text-slate-500">Gerencie sua agenda e aumente seus ganhos.</p>
        </button>
      </div>
    </div>
  );
}
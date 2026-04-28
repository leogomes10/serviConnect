import { useState, useEffect } from 'react';
import { Wrench, Zap, Droplets, Paintbrush, Search, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from './types';
import { RoleSelection } from './components/RoleSelection';
import { CustomerView } from './components/CustomerViews';

export default function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<number>(0);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/profissionais');
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
  <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
    {userRole === 0 && (
      <RoleSelection onSelect={setUserRole} />
    )}

    {userRole === 1 && (
      <CustomerView 
        services={services}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onBack={() => setUserRole(0)}
      />
    )}

    {userRole === 2 && (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Em breve: Painel do Profissional</h2>
        <button onClick={() => setUserRole(0)} className="text-indigo-600 font-bold mt-4">Voltar</button>
      </div>
    )}
  </div>
);}

 


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Stethoscope, Calendar, FileText, DollarSign,
  Building2, ListTodo, Receipt, HardHat, ChevronLeft, ChevronRight,
  LogOut, Scissors, ShoppingBag, UserCheck, Package, ClipboardList,
  Home, Heart, Apple, Scale, Gavel, FileSearch, UtensilsCrossed, Truck,
  Sparkles, Star, SmilePlus, Briefcase, BookOpen, Timer, Salad,
  Ruler, Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearAuth } from '@/lib/api';

type ModuleKey = 'clinic' | 'construction' | 'barbershop' | 'realestate' | 'nutrition' | 'legal' | 'restaurant' | 'aesthetic' | 'dental';

const modules: { key: ModuleKey; label: string }[] = [
  { key: 'clinic', label: 'Clínica' },
  { key: 'construction', label: 'Construção' },
  { key: 'barbershop', label: 'Barbearia' },
  { key: 'realestate', label: 'Imobiliária' },
  { key: 'nutrition', label: 'Nutrição' },
  { key: 'legal', label: 'Jurídico' },
  { key: 'restaurant', label: 'Restaurante' },
  { key: 'aesthetic', label: 'Estética' },
  { key: 'dental', label: 'Dentista' },
];

const menus: Record<ModuleKey, { name: string; href: string; icon: any }[]> = {
  clinic: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pacientes', href: '/clinic/patients', icon: Users },
    { name: 'Médicos', href: '/clinic/doctors', icon: Stethoscope },
    { name: 'Agenda', href: '/clinic/appointments', icon: Calendar },
    { name: 'Prontuários', href: '/clinic/records', icon: FileText },
    { name: 'Faturamento', href: '/clinic/billing', icon: DollarSign },
  ],
  construction: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projetos', href: '/construction/projects', icon: Building2 },
    { name: 'Tarefas', href: '/construction/tasks', icon: ListTodo },
    { name: 'Despesas', href: '/construction/expenses', icon: Receipt },
    { name: 'Equipe', href: '/construction/workers', icon: HardHat },
  ],
  barbershop: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agendamentos', href: '/barbershop/bookings', icon: Calendar },
    { name: 'Barbeiros', href: '/barbershop/barbers', icon: Scissors },
    { name: 'Clientes', href: '/barbershop/clients', icon: UserCheck },
    { name: 'Serviços', href: '/barbershop/services', icon: ClipboardList },
    { name: 'Produtos', href: '/barbershop/products', icon: Package },
    { name: 'Comandas', href: '/barbershop/orders', icon: ShoppingBag },
  ],
  realestate: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Imóveis', href: '/realestate/properties', icon: Home },
    { name: 'Clientes', href: '/realestate/clients', icon: Users },
    { name: 'Visitas', href: '/realestate/visits', icon: Calendar },
    { name: 'Negócios', href: '/realestate/deals', icon: Briefcase },
  ],
  nutrition: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pacientes', href: '/nutrition/patients', icon: Users },
    { name: 'Planos', href: '/nutrition/plans', icon: Salad },
    { name: 'Refeições', href: '/nutrition/meals', icon: Apple },
    { name: 'Consultas', href: '/nutrition/appointments', icon: Calendar },
    { name: 'Medidas', href: '/nutrition/measurements', icon: Scale },
  ],
  legal: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/legal/clients', icon: Users },
    { name: 'Processos', href: '/legal/cases', icon: Gavel },
    { name: 'Documentos', href: '/legal/documents', icon: FileSearch },
    { name: 'Tarefas', href: '/legal/tasks', icon: ListTodo },
    { name: 'Financeiro', href: '/legal/billings', icon: DollarSign },
  ],
  restaurant: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Categorias', href: '/restaurant/categories', icon: BookOpen },
    { name: 'Cardápio', href: '/restaurant/menu-items', icon: UtensilsCrossed },
    { name: 'Pedidos', href: '/restaurant/orders', icon: ClipboardList },
    { name: 'Entregadores', href: '/restaurant/drivers', icon: Truck },
  ],
  aesthetic: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/aesthetic/clients', icon: Users },
    { name: 'Procedimentos', href: '/aesthetic/procedures', icon: Sparkles },
    { name: 'Agendamentos', href: '/aesthetic/appointments', icon: Calendar },
    { name: 'Pacotes', href: '/aesthetic/packages', icon: Star },
    { name: 'Financeiro', href: '/aesthetic/billings', icon: DollarSign },
  ],
  dental: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pacientes', href: '/dental/patients', icon: Users },
    { name: 'Dentistas', href: '/dental/dentists', icon: SmilePlus },
    { name: 'Tratamentos', href: '/dental/treatments', icon: Pill },
    { name: 'Agenda', href: '/dental/appointments', icon: Calendar },
    { name: 'Planos', href: '/dental/treatment-plans', icon: FileText },
    { name: 'Financeiro', href: '/dental/billings', icon: DollarSign },
  ],
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [module, setModule] = useState<ModuleKey>('clinic');
  const pathname = usePathname();

  const menu = menus[module];

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/auth/login';
  };

  return (
    <aside className={cn(
      'h-screen bg-secondary-900 text-white flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-secondary-700">
        {!collapsed && <h1 className="text-xl font-bold text-primary-400">Vertix</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-secondary-700">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-3">
          <select
            value={module}
            onChange={(e) => setModule(e.target.value as ModuleKey)}
            className="w-full bg-secondary-700 text-white text-sm rounded-lg px-3 py-2 border border-secondary-600 focus:border-primary-500 focus:outline-none"
          >
            {modules.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-secondary-700 hover:text-white'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-secondary-700 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-secondary-700 hover:text-white w-full transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}

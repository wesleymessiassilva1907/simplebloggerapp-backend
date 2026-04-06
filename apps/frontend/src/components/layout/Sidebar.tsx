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
  Ruler, Pill, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearAuth } from '@/lib/api';

type ModuleKey = 'clinic' | 'construction' | 'barbershop' | 'realestate' | 'nutrition' | 'legal' | 'restaurant' | 'aesthetic' | 'dental';

const modules: { key: ModuleKey; label: string }[] = [
  { key: 'clinic', label: 'Clinica' },
  { key: 'construction', label: 'Construcao' },
  { key: 'barbershop', label: 'Barbearia' },
  { key: 'realestate', label: 'Imobiliaria' },
  { key: 'nutrition', label: 'Nutricao' },
  { key: 'legal', label: 'Juridico' },
  { key: 'restaurant', label: 'Restaurante' },
  { key: 'aesthetic', label: 'Estetica' },
  { key: 'dental', label: 'Dentista' },
];

const menus: Record<ModuleKey, { name: string; href: string; icon: any }[]> = {
  clinic: [
    { name: 'Visao Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/clinic/dashboard', icon: Activity },
    { name: 'Pacientes', href: '/clinic/patients', icon: Users },
    { name: 'Medicos', href: '/clinic/doctors', icon: Stethoscope },
    { name: 'Agenda', href: '/clinic/appointments', icon: Calendar },
    { name: 'Prontuarios', href: '/clinic/records', icon: FileText },
    { name: 'Faturamento', href: '/clinic/billing', icon: DollarSign },
  ],
  construction: [
    { name: 'Visao Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/construction/dashboard', icon: Activity },
    { name: 'Projetos', href: '/construction/projects', icon: Building2 },
    { name: 'Tarefas', href: '/construction/tasks', icon: ListTodo },
    { name: 'Despesas', href: '/construction/expenses', icon: Receipt },
    { name: 'Equipe', href: '/construction/workers', icon: HardHat },
  ],
  barbershop: [
    { name: 'Visao Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/barbershop/dashboard', icon: Activity },
    { name: 'Agendamentos', href: '/barbershop/bookings', icon: Calendar },
    { name: 'Barbeiros', href: '/barbershop/barbers', icon: Scissors },
    { name: 'Clientes', href: '/barbershop/clients', icon: UserCheck },
    { name: 'Servicos', href: '/barbershop/services', icon: ClipboardList },
    { name: 'Produtos', href: '/barbershop/products', icon: Package },
    { name: 'Comandas', href: '/barbershop/orders', icon: ShoppingBag },
  ],
  realestate: [
    { name: 'Visao Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/realestate/dashboard', icon: Activity },
    { name: 'Imoveis', href: '/realestate/properties', icon: Home },
    { name: 'Clientes', href: '/realestate/clients', icon: Users },
    { name: 'Visitas', href: '/realestate/visits', icon: Calendar },
    { name: 'Negocios', href: '/realestate/deals', icon: Briefcase },
  ],
  nutrition: [
    { name: 'Visao Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/nutrition/dashboard', icon: Activity },
    { name: 'Pacientes', href: '/nutrition/patients', icon: Users },
    { name: 'Planos', href: '/nutrition/plans', icon: Salad },
    { name: 'Refeicoes', href: '/nutrition/meals', icon: Apple },
    { name: 'Consultas', href: '/nutrition/appointments', icon: Calendar },
    { name: 'Medidas', href: '/nutrition/measurements', icon: Scale },
  ],
  legal: [
    { name: 'Visao Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/legal/dashboard', icon: Activity },
    { name: 'Clientes', href: '/legal/clients', icon: Users },
    { name: 'Processos', href: '/legal/cases', icon: Gavel },
    { name: 'Documentos', href: '/legal/documents', icon: FileSearch },
    { name: 'Tarefas', href: '/legal/tasks', icon: ListTodo },
    { name: 'Financeiro', href: '/legal/billings', icon: DollarSign },
  ],
  restaurant: [
    { name: 'Visao Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/restaurant/dashboard', icon: Activity },
    { name: 'Categorias', href: '/restaurant/categories', icon: BookOpen },
    { name: 'Cardapio', href: '/restaurant/menu-items', icon: UtensilsCrossed },
    { name: 'Pedidos', href: '/restaurant/orders', icon: ClipboardList },
    { name: 'Entregadores', href: '/restaurant/drivers', icon: Truck },
  ],
  aesthetic: [
    { name: 'Visao Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/aesthetic/dashboard', icon: Activity },
    { name: 'Clientes', href: '/aesthetic/clients', icon: Users },
    { name: 'Procedimentos', href: '/aesthetic/procedures', icon: Sparkles },
    { name: 'Agendamentos', href: '/aesthetic/appointments', icon: Calendar },
    { name: 'Pacotes', href: '/aesthetic/packages', icon: Star },
    { name: 'Financeiro', href: '/aesthetic/billings', icon: DollarSign },
  ],
  dental: [
    { name: 'Visao Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/dental/dashboard', icon: Activity },
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
      'h-screen bg-[var(--sidebar-bg)] text-white flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-brand-900/30 dark:border-surface-800">
        {!collapsed && <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">Vertix</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-[var(--sidebar-hover)]">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-3">
          <select
            value={module}
            onChange={(e) => setModule(e.target.value as ModuleKey)}
            className="w-full bg-brand-900/50 text-white text-sm rounded-lg px-3 py-2 border border-brand-800/50 focus:border-brand-500 focus:outline-none"
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
                isActive ? 'bg-[var(--sidebar-active)] text-white' : 'text-gray-300 hover:bg-[var(--sidebar-hover)] hover:text-white'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-brand-900/30 dark:border-surface-800 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-[var(--sidebar-hover)] hover:text-white w-full transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Stethoscope, Calendar, FileText, DollarSign,
  Building2, ListTodo, Receipt, HardHat, ChevronLeft, ChevronRight,
  LogOut, Settings, Brain, Scissors, ShoppingBag, UserCheck, Package, ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearAuth, getUser } from '@/lib/api';

const clinicMenu = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/clinic/patients', icon: Users },
  { name: 'Médicos', href: '/clinic/doctors', icon: Stethoscope },
  { name: 'Agenda', href: '/clinic/appointments', icon: Calendar },
  { name: 'Prontuários', href: '/clinic/records', icon: FileText },
  { name: 'Faturamento', href: '/clinic/billing', icon: DollarSign },
];

const constructionMenu = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projetos', href: '/construction/projects', icon: Building2 },
  { name: 'Tarefas', href: '/construction/tasks', icon: ListTodo },
  { name: 'Despesas', href: '/construction/expenses', icon: Receipt },
  { name: 'Equipe', href: '/construction/workers', icon: HardHat },
];

const barbershopMenu = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agendamentos', href: '/barbershop/bookings', icon: Calendar },
  { name: 'Barbeiros', href: '/barbershop/barbers', icon: Scissors },
  { name: 'Clientes', href: '/barbershop/clients', icon: UserCheck },
  { name: 'Serviços', href: '/barbershop/services', icon: ClipboardList },
  { name: 'Produtos', href: '/barbershop/products', icon: Package },
  { name: 'Comandas', href: '/barbershop/orders', icon: ShoppingBag },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [module, setModule] = useState<'clinic' | 'construction' | 'barbershop'>('clinic');
  const pathname = usePathname();

  const menu = module === 'clinic' ? clinicMenu : module === 'construction' ? constructionMenu : barbershopMenu;

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
        {!collapsed && <h1 className="text-xl font-bold text-primary-400">NexusHub</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-secondary-700">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex gap-1 p-3">
          <button
            onClick={() => setModule('clinic')}
            className={cn('flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors',
              module === 'clinic' ? 'bg-primary-600 text-white' : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
            )}
          >
            Clínica
          </button>
          <button
            onClick={() => setModule('construction')}
            className={cn('flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors',
              module === 'construction' ? 'bg-primary-600 text-white' : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
            )}
          >
            Construção
          </button>
          <button
            onClick={() => setModule('barbershop')}
            className={cn('flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors',
              module === 'barbershop' ? 'bg-primary-600 text-white' : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
            )}
          >
            Barbearia
          </button>
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

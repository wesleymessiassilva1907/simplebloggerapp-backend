'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, Plus, Pencil, Trash2 } from 'lucide-react';

interface Billing {
  id: string;
  clientId: string;
  client?: { name: string };
  caseId: string;
  case?: { title: string };
  description: string;
  type: string;
  amount: number;
  hoursWorked: number;
  hourlyRate: number;
  status: string;
  dueDate: string;
}

interface Client {
  id: string;
  name: string;
}

interface Case {
  id: string;
  title: string;
  caseNumber: string;
}

const initialForm = {
  clientId: '',
  caseId: '',
  description: '',
  type: 'honorario',
  amount: '',
  hoursWorked: '',
  hourlyRate: '',
  status: 'pendente',
  dueDate: '',
};

export default function LegalBillingsPage() {
  const [data, setData] = useState<Billing[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Billing | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchData();
    fetchClients();
    fetchCases();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get('/legal/billings');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar financeiro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClients() {
    try {
      const response = await api.get('/legal/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }

  async function fetchCases() {
    try {
      const response = await api.get('/legal/cases');
      setCases(response.data);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount) || 0,
        hoursWorked: parseFloat(form.hoursWorked) || 0,
        hourlyRate: parseFloat(form.hourlyRate) || 0,
      };
      if (editItem) {
        await api.put(`/legal/billings/${editItem.id}`, payload);
      } else {
        await api.post('/legal/billings', payload);
      }
      setShowModal(false);
      setEditItem(null);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar registro financeiro:', error);
    }
  }

  function handleEdit(item: Billing) {
    setEditItem(item);
    setForm({
      clientId: item.clientId,
      caseId: item.caseId || '',
      description: item.description,
      type: item.type,
      amount: String(item.amount),
      hoursWorked: String(item.hoursWorked),
      hourlyRate: String(item.hourlyRate),
      status: item.status,
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    try {
      await api.delete(`/legal/billings/${id}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
    }
  }

  const columns = [
    { header: 'Descrição', accessor: 'description' as keyof Billing },
    {
      header: 'Cliente',
      accessor: 'clientId' as keyof Billing,
      cell: (item: Billing) => item.client?.name || '-',
    },
    {
      header: 'Tipo',
      accessor: 'type' as keyof Billing,
      cell: (item: Billing) => {
        const types: Record<string, string> = {
          honorario: 'Honorário',
          despesa: 'Despesa',
          custas: 'Custas',
          consulta: 'Consulta',
        };
        return types[item.type] || item.type;
      },
    },
    {
      header: 'Valor',
      accessor: 'amount' as keyof Billing,
      cell: (item: Billing) => formatCurrency(item.amount),
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Billing,
      cell: (item: Billing) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Vencimento',
      accessor: 'dueDate' as keyof Billing,
      cell: (item: Billing) => formatDate(item.dueDate),
    },
    {
      header: 'Ações',
      accessor: 'id' as keyof Billing,
      cell: (item: Billing) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(item)} className="text-brand-500 hover:text-brand-700">
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Financeiro Jurídico"
        icon={<DollarSign />}
        action={
          <button
            onClick={() => {
              setEditItem(null);
              setForm(initialForm);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Novo Registro
          </button>
        }
      />

      <DataTable columns={columns} data={data} loading={loading} />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditItem(null);
          setForm(initialForm);
        }}
        title={editItem ? 'Editar Registro' : 'Novo Registro'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Processo (opcional)</label>
            <select
              value={form.caseId}
              onChange={(e) => setForm({ ...form, caseId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Nenhum</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="honorario">Honorário</option>
              <option value="despesa">Despesa</option>
              <option value="custas">Custas</option>
              <option value="consulta">Consulta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Horas Trabalhadas</label>
            <input
              type="number"
              step="0.5"
              value={form.hoursWorked}
              onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor/Hora</label>
            <input
              type="number"
              step="0.01"
              value={form.hourlyRate}
              onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="pendente">Pendente</option>
              <option value="faturado">Faturado</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditItem(null);
                setForm(initialForm);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-[var(--bg-primary)]"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editItem ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

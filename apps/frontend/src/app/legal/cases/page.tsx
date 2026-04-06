'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Scale, Plus, Pencil, Trash2 } from 'lucide-react';

interface Case {
  id: string;
  clientId: string;
  client?: { name: string };
  caseNumber: string;
  title: string;
  description: string;
  type: string;
  court: string;
  judge: string;
  status: string;
  priority: string;
  value: number;
  filingDate: string;
  nextHearingDate: string;
  notes: string;
}

interface Client {
  id: string;
  name: string;
}

const initialForm = {
  clientId: '',
  caseNumber: '',
  title: '',
  description: '',
  type: 'civel',
  court: '',
  judge: '',
  status: 'ativo',
  priority: 'media',
  value: '',
  filingDate: '',
  nextHearingDate: '',
  notes: '',
};

export default function LegalCasesPage() {
  const [data, setData] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Case | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchData();
    fetchClients();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get('/legal/cases');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, value: parseFloat(form.value) || 0 };
      if (editItem) {
        await api.put(`/legal/cases/${editItem.id}`, payload);
      } else {
        await api.post('/legal/cases', payload);
      }
      setShowModal(false);
      setEditItem(null);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
    }
  }

  function handleEdit(item: Case) {
    setEditItem(item);
    setForm({
      clientId: item.clientId,
      caseNumber: item.caseNumber,
      title: item.title,
      description: item.description,
      type: item.type,
      court: item.court,
      judge: item.judge,
      status: item.status,
      priority: item.priority,
      value: String(item.value),
      filingDate: item.filingDate ? item.filingDate.split('T')[0] : '',
      nextHearingDate: item.nextHearingDate ? item.nextHearingDate.split('T')[0] : '',
      notes: item.notes,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este processo?')) return;
    try {
      await api.delete(`/legal/cases/${id}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
    }
  }

  const columns = [
    { header: 'Número', accessor: 'caseNumber' as keyof Case },
    { header: 'Título', accessor: 'title' as keyof Case },
    {
      header: 'Cliente',
      accessor: 'clientId' as keyof Case,
      cell: (item: Case) => item.client?.name || '-',
    },
    {
      header: 'Tipo',
      accessor: 'type' as keyof Case,
      cell: (item: Case) => {
        const types: Record<string, string> = {
          civel: 'Cível',
          criminal: 'Criminal',
          trabalhista: 'Trabalhista',
          tributario: 'Tributário',
          familia: 'Família',
          empresarial: 'Empresarial',
        };
        return types[item.type] || item.type;
      },
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Case,
      cell: (item: Case) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Prioridade',
      accessor: 'priority' as keyof Case,
      cell: (item: Case) => {
        const priorities: Record<string, string> = {
          baixa: 'Baixa',
          media: 'Média',
          alta: 'Alta',
          urgente: 'Urgente',
        };
        return priorities[item.priority] || item.priority;
      },
    },
    {
      header: 'Valor',
      accessor: 'value' as keyof Case,
      cell: (item: Case) => formatCurrency(item.value),
    },
    {
      header: 'Ações',
      accessor: 'id' as keyof Case,
      cell: (item: Case) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
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
        title="Processos"
        icon={<Scale />}
        action={
          <button
            onClick={() => {
              setEditItem(null);
              setForm(initialForm);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Novo Processo
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
        title={editItem ? 'Editar Processo' : 'Novo Processo'}
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
            <label className="block text-sm font-medium mb-1">Número do Processo</label>
            <input
              type="text"
              value={form.caseNumber}
              onChange={(e) => setForm({ ...form, caseNumber: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="civel">Cível</option>
              <option value="criminal">Criminal</option>
              <option value="trabalhista">Trabalhista</option>
              <option value="tributario">Tributário</option>
              <option value="familia">Família</option>
              <option value="empresarial">Empresarial</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tribunal</label>
            <input
              type="text"
              value={form.court}
              onChange={(e) => setForm({ ...form, court: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Juiz</label>
            <input
              type="text"
              value={form.judge}
              onChange={(e) => setForm({ ...form, judge: e.target.value })}
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
              <option value="ativo">Ativo</option>
              <option value="arquivado">Arquivado</option>
              <option value="ganho">Ganho</option>
              <option value="perdido">Perdido</option>
              <option value="acordo">Acordo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prioridade</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor</label>
            <input
              type="number"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Abertura</label>
            <input
              type="date"
              value={form.filingDate}
              onChange={(e) => setForm({ ...form, filingDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Próxima Audiência</label>
            <input
              type="date"
              value={form.nextHearingDate}
              onChange={(e) => setForm({ ...form, nextHearingDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
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
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {editItem ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

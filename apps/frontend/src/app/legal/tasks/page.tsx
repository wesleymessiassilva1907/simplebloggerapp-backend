'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { CheckSquare, Plus, Pencil, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  caseId: string;
  case?: { title: string };
  title: string;
  description: string;
  type: string;
  dueDate: string;
  status: string;
  priority: string;
  assignedTo: string;
}

interface Case {
  id: string;
  title: string;
  caseNumber: string;
}

const initialForm = {
  caseId: '',
  title: '',
  description: '',
  type: 'audiencia',
  dueDate: '',
  status: 'pendente',
  priority: 'media',
  assignedTo: '',
};

export default function LegalTasksPage() {
  const [data, setData] = useState<Task[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Task | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchData();
    fetchCases();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get('/legal/tasks');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
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
      if (editItem) {
        await api.put(`/legal/tasks/${editItem.id}`, form);
      } else {
        await api.post('/legal/tasks', form);
      }
      setShowModal(false);
      setEditItem(null);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  }

  function handleEdit(item: Task) {
    setEditItem(item);
    setForm({
      caseId: item.caseId,
      title: item.title,
      description: item.description,
      type: item.type,
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
      status: item.status,
      priority: item.priority,
      assignedTo: item.assignedTo,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await api.delete(`/legal/tasks/${id}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  }

  const columns = [
    { header: 'Título', accessor: 'title' as keyof Task },
    {
      header: 'Processo',
      accessor: 'caseId' as keyof Task,
      cell: (item: Task) => item.case?.title || '-',
    },
    {
      header: 'Tipo',
      accessor: 'type' as keyof Task,
      cell: (item: Task) => {
        const types: Record<string, string> = {
          audiencia: 'Audiência',
          prazo: 'Prazo',
          protocolo: 'Protocolo',
          reuniao: 'Reunião',
          pesquisa: 'Pesquisa',
        };
        return types[item.type] || item.type;
      },
    },
    {
      header: 'Vencimento',
      accessor: 'dueDate' as keyof Task,
      cell: (item: Task) => formatDate(item.dueDate),
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Task,
      cell: (item: Task) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Prioridade',
      accessor: 'priority' as keyof Task,
      cell: (item: Task) => {
        const priorities: Record<string, string> = {
          baixa: 'Baixa',
          media: 'Média',
          alta: 'Alta',
        };
        return priorities[item.priority] || item.priority;
      },
    },
    {
      header: 'Ações',
      accessor: 'id' as keyof Task,
      cell: (item: Task) => (
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
        title="Tarefas Jurídicas"
        icon={<CheckSquare />}
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
            Nova Tarefa
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
        title={editItem ? 'Editar Tarefa' : 'Nova Tarefa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Processo</label>
            <select
              value={form.caseId}
              onChange={(e) => setForm({ ...form, caseId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Selecione um processo</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title}
                </option>
              ))}
            </select>
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
              <option value="audiencia">Audiência</option>
              <option value="prazo">Prazo</option>
              <option value="protocolo">Protocolo</option>
              <option value="reuniao">Reunião</option>
              <option value="pesquisa">Pesquisa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
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
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="atrasada">Atrasada</option>
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
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Responsável</label>
            <input
              type="text"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
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
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {editItem ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

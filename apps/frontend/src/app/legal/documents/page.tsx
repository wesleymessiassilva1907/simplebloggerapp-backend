'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';

interface Document {
  id: string;
  caseId: string;
  case?: { title: string };
  title: string;
  type: string;
  content: string;
  status: string;
  version: string;
  createdAt: string;
}

interface Case {
  id: string;
  title: string;
  caseNumber: string;
}

const initialForm = {
  caseId: '',
  title: '',
  type: 'peticao',
  content: '',
  status: 'rascunho',
  version: '1.0',
};

export default function LegalDocumentsPage() {
  const [data, setData] = useState<Document[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Document | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchData();
    fetchCases();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get('/legal/documents');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
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
        await api.put(`/legal/documents/${editItem.id}`, form);
      } else {
        await api.post('/legal/documents', form);
      }
      setShowModal(false);
      setEditItem(null);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
    }
  }

  function handleEdit(item: Document) {
    setEditItem(item);
    setForm({
      caseId: item.caseId,
      title: item.title,
      type: item.type,
      content: item.content,
      status: item.status,
      version: item.version,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;
    try {
      await api.delete(`/legal/documents/${id}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
    }
  }

  const columns = [
    { header: 'Título', accessor: 'title' as keyof Document },
    {
      header: 'Processo',
      accessor: 'caseId' as keyof Document,
      cell: (item: Document) => item.case?.title || '-',
    },
    {
      header: 'Tipo',
      accessor: 'type' as keyof Document,
      cell: (item: Document) => {
        const types: Record<string, string> = {
          peticao: 'Petição',
          contrato: 'Contrato',
          procuracao: 'Procuração',
          sentenca: 'Sentença',
          parecer: 'Parecer',
          prova: 'Prova',
        };
        return types[item.type] || item.type;
      },
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Document,
      cell: (item: Document) => <StatusBadge status={item.status} />,
    },
    { header: 'Versão', accessor: 'version' as keyof Document },
    {
      header: 'Criado em',
      accessor: 'createdAt' as keyof Document,
      cell: (item: Document) => formatDate(item.createdAt),
    },
    {
      header: 'Ações',
      accessor: 'id' as keyof Document,
      cell: (item: Document) => (
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
        title="Documentos"
        icon={<FileText />}
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
            Novo Documento
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
        title={editItem ? 'Editar Documento' : 'Novo Documento'}
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
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="peticao">Petição</option>
              <option value="contrato">Contrato</option>
              <option value="procuracao">Procuração</option>
              <option value="sentenca">Sentença</option>
              <option value="parecer">Parecer</option>
              <option value="prova">Prova</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Conteúdo</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="rascunho">Rascunho</option>
              <option value="revisao">Revisão</option>
              <option value="final">Final</option>
              <option value="protocolado">Protocolado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Versão</label>
            <input
              type="text"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
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

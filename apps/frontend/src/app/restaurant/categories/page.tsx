'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { LayoutGrid, Plus, Pencil, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

const initialForm = {
  name: '',
  description: '',
  sortOrder: '0',
  isActive: true,
};

export default function RestaurantCategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get('/restaurant/categories');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder) || 0 };
      if (editItem) {
        await api.put(`/restaurant/categories/${editItem.id}`, payload);
      } else {
        await api.post('/restaurant/categories', payload);
      }
      setShowModal(false);
      setEditItem(null);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  }

  function handleEdit(item: Category) {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description,
      sortOrder: String(item.sortOrder),
      isActive: item.isActive,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.delete(`/restaurant/categories/${id}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  }

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof Category },
    { header: 'Descrição', accessor: 'description' as keyof Category },
    { header: 'Ordem', accessor: 'sortOrder' as keyof Category },
    {
      header: 'Ativo',
      accessor: 'isActive' as keyof Category,
      cell: (item: Category) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.isActive ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      header: 'Ações',
      accessor: 'id' as keyof Category,
      cell: (item: Category) => (
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
        title="Categorias do Cardápio"
        icon={<LayoutGrid />}
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
            Nova Categoria
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
        title={editItem ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            <label className="block text-sm font-medium mb-1">Ordem de Exibição</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Ativo
            </label>
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

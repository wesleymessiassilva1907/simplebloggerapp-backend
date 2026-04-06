'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { UtensilsCrossed, Plus, Pencil, Trash2 } from 'lucide-react';

interface MenuItem {
  id: string;
  categoryId: string;
  category?: { name: string };
  name: string;
  description: string;
  price: number;
  prepTime: number;
  isAvailable: boolean;
  isPromotion: boolean;
  promotionPrice: number;
  calories: number;
}

interface Category {
  id: string;
  name: string;
}

const initialForm = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  prepTime: '',
  isAvailable: true,
  isPromotion: false,
  promotionPrice: '',
  calories: '',
};

export default function RestaurantMenuItemsPage() {
  const [data, setData] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get('/restaurant/menu-items');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await api.get('/restaurant/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        prepTime: parseInt(form.prepTime) || 0,
        promotionPrice: parseFloat(form.promotionPrice) || 0,
        calories: parseInt(form.calories) || 0,
      };
      if (editItem) {
        await api.put(`/restaurant/menu-items/${editItem.id}`, payload);
      } else {
        await api.post('/restaurant/menu-items', payload);
      }
      setShowModal(false);
      setEditItem(null);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    }
  }

  function handleEdit(item: MenuItem) {
    setEditItem(item);
    setForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: String(item.price),
      prepTime: String(item.prepTime),
      isAvailable: item.isAvailable,
      isPromotion: item.isPromotion,
      promotionPrice: String(item.promotionPrice || ''),
      calories: String(item.calories || ''),
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      await api.delete(`/restaurant/menu-items/${id}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    }
  }

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof MenuItem },
    {
      header: 'Categoria',
      accessor: 'categoryId' as keyof MenuItem,
      cell: (item: MenuItem) => item.category?.name || '-',
    },
    {
      header: 'Preço',
      accessor: 'price' as keyof MenuItem,
      cell: (item: MenuItem) => formatCurrency(item.price),
    },
    {
      header: 'Tempo Preparo',
      accessor: 'prepTime' as keyof MenuItem,
      cell: (item: MenuItem) => `${item.prepTime} min`,
    },
    {
      header: 'Disponível',
      accessor: 'isAvailable' as keyof MenuItem,
      cell: (item: MenuItem) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.isAvailable ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      header: 'Promoção',
      accessor: 'isPromotion' as keyof MenuItem,
      cell: (item: MenuItem) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.isPromotion ? 'bg-yellow-100 text-yellow-800' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'}`}>
          {item.isPromotion ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      header: 'Ações',
      accessor: 'id' as keyof MenuItem,
      cell: (item: MenuItem) => (
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
        title="Cardápio"
        icon={<UtensilsCrossed />}
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
            Novo Item
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
        title={editItem ? 'Editar Item' : 'Novo Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
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
            <label className="block text-sm font-medium mb-1">Preço</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tempo de Preparo (minutos)</label>
            <input
              type="number"
              value={form.prepTime}
              onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium">
              Disponível
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPromotion"
              checked={form.isPromotion}
              onChange={(e) => setForm({ ...form, isPromotion: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isPromotion" className="text-sm font-medium">
              Em Promoção
            </label>
          </div>
          {form.isPromotion && (
            <div>
              <label className="block text-sm font-medium mb-1">Preço Promocional</label>
              <input
                type="number"
                step="0.01"
                value={form.promotionPrice}
                onChange={(e) => setForm({ ...form, promotionPrice: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Calorias</label>
            <input
              type="number"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
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

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '0', category: 'pomada', isActive: true });

  const fetchData = async () => {
    try { const res = await api('/barbershop/products?limit=100'); setProducts(res.data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editItem) { await api(`/barbershop/products/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/barbershop/products', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); setForm({ name: '', description: '', price: '', stock: '0', category: 'pomada', isActive: true }); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', price: String(item.price || ''), stock: String(item.stock || 0), category: item.category || 'pomada', isActive: item.isActive !== false });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try { await api(`/barbershop/products/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const categoryLabels: Record<string, string> = { pomada: 'Pomada', shampoo: 'Shampoo', 'óleo': 'Óleo', 'acessório': 'Acessório' };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'category', label: 'Categoria', render: (item: any) => categoryLabels[item.category] || item.category || '-' },
    { key: 'price', label: 'Preço', render: (item: any) => formatCurrency(item.price) },
    { key: 'stock', label: 'Estoque', render: (item: any) => (
      <span className={`font-medium ${(item.stock || 0) <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
        {item.stock || 0}
      </span>
    )},
    { key: 'description', label: 'Descrição', render: (item: any) => item.description ? (item.description.length > 40 ? item.description.substring(0, 40) + '...' : item.description) : '-' },
    { key: 'isActive', label: 'Status', render: (item: any) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {item.isActive ? 'Ativo' : 'Inativo'}
      </span>
    )},
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Produtos" subtitle="Gerencie o estoque de produtos"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', description: '', price: '', stock: '0', category: 'pomada', isActive: true }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Produto</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={products} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Produto' : 'Novo Produto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label><input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Estoque *</label><input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                <option value="pomada">Pomada</option>
                <option value="shampoo">Shampoo</option>
                <option value="óleo">Óleo</option>
                <option value="acessório">Acessório</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded border-gray-300" />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Produto ativo</label>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

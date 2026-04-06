'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '30', category: 'corte', isActive: true });

  const fetchData = async () => {
    try { const res = await api('/barbershop/services?limit=100'); setServices(res.data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, price: parseFloat(form.price), duration: parseInt(form.duration) };
      if (editItem) { await api(`/barbershop/services/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/barbershop/services', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); setForm({ name: '', description: '', price: '', duration: '30', category: 'corte', isActive: true }); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', price: String(item.price || ''), duration: String(item.duration || 30), category: item.category || 'corte', isActive: item.isActive !== false });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    try { await api(`/barbershop/services/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const categoryLabels: Record<string, string> = { corte: 'Corte', barba: 'Barba', combo: 'Combo', tratamento: 'Tratamento' };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'category', label: 'Categoria', render: (item: any) => categoryLabels[item.category] || item.category || '-' },
    { key: 'price', label: 'Preço', render: (item: any) => formatCurrency(item.price) },
    { key: 'duration', label: 'Duração', render: (item: any) => `${item.duration || 0} min` },
    { key: 'description', label: 'Descrição', render: (item: any) => item.description || '-' },
    { key: 'isActive', label: 'Status', render: (item: any) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {item.isActive ? 'Ativo' : 'Inativo'}
      </span>
    )},
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Serviços" subtitle="Gerencie os serviços oferecidos"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', description: '', price: '', duration: '30', category: 'corte', isActive: true }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Serviço</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={services} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Serviço' : 'Novo Serviço'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Descrição</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Preço (R$) *</label><input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Duração (min) *</label><input type="number" min="1" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Categoria *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                <option value="corte">Corte</option>
                <option value="barba">Barba</option>
                <option value="combo">Combo</option>
                <option value="tratamento">Tratamento</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded border-[var(--border)]" />
            <label htmlFor="isActive" className="text-sm font-medium text-[var(--text-secondary)]">Serviço ativo</label>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

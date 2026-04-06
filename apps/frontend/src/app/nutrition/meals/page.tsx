'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function MealsPage() {
  const [meals, setMeals] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ planId: '', name: 'café da manhã', time: '', foods: '', notes: '' });

  const fetchData = async () => {
    try {
      const [mealsRes, plansRes] = await Promise.all([
        api('/nutrition/meals?limit=100'),
        api('/nutrition/plans?limit=100'),
      ]);
      setMeals(mealsRes.data || []);
      setPlans(plansRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (editItem) { await api(`/nutrition/meals/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/nutrition/meals', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ planId: item.planId || '', name: item.name || 'café da manhã', time: item.time || '', foods: item.foods || '', notes: item.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta refeição?')) return;
    try { await api(`/nutrition/meals/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const getPlanName = (id: string) => plans.find(p => p.id === id)?.name || '-';

  const columns = [
    { key: 'planId', label: 'Plano', render: (item: any) => item.plan?.name || getPlanName(item.planId) },
    { key: 'name', label: 'Refeição' },
    { key: 'time', label: 'Horário', render: (item: any) => item.time || '-' },
    { key: 'notes', label: 'Observações', render: (item: any) => item.notes ? (item.notes.length > 40 ? item.notes.substring(0, 40) + '...' : item.notes) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Refeições" subtitle="Gerencie as refeições dos planos nutricionais"
        action={<button onClick={() => { setEditItem(null); setForm({ planId: '', name: 'café da manhã', time: '', foods: '', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Refeição</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={meals} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Refeição' : 'Nova Refeição'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Plano Nutricional *</label>
            <select value={form.planId} onChange={e => setForm({...form, planId: e.target.value})} className="input-field" required>
              <option value="">Selecione um plano</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Refeição *</label>
              <select value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field">
                <option value="café da manhã">Café da Manhã</option><option value="lanche manhã">Lanche da Manhã</option><option value="almoço">Almoço</option><option value="lanche tarde">Lanche da Tarde</option><option value="jantar">Jantar</option><option value="ceia">Ceia</option>
              </select></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Horário</label><input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Alimentos (JSON)</label><input value={form.foods} onChange={e => setForm({...form, foods: e.target.value})} className="input-field" placeholder="Ex: arroz, feijão, frango grelhado" /></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

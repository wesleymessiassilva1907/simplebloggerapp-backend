'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', budget: '', status: 'planning', location: '' });

  const fetchData = async () => {
    try { const res = await api('/construction/projects?limit=100'); setProjects(res.data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, budget: form.budget ? parseFloat(form.budget) : undefined };
      if (editItem) { await api(`/construction/projects/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/construction/projects', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '', budget: item.budget ? String(item.budget) : '', status: item.status, location: item.location || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este projeto?')) return;
    try { await api(`/construction/projects/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Projeto' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'budget', label: 'Orçamento', render: (item: any) => item.budget ? formatCurrency(Number(item.budget)) : '-' },
    { key: 'startDate', label: 'Início', render: (item: any) => item.startDate ? formatDate(item.startDate) : '-' },
    { key: 'endDate', label: 'Previsão', render: (item: any) => item.endDate ? formatDate(item.endDate) : '-' },
    { key: 'location', label: 'Local', render: (item: any) => item.location || '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Projetos" subtitle="Gerencie os projetos de construção"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', description: '', startDate: '', endDate: '', budget: '', status: 'planning', location: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Projeto</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={projects} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Projeto' : 'Novo Projeto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Descrição</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data Início</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Previsão Término</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Orçamento (R$)</label><input type="number" step="0.01" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="planning">Planejamento</option><option value="in_progress">Em Andamento</option><option value="paused">Pausado</option><option value="completed">Concluído</option><option value="canceled">Cancelado</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Localização</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field" /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ projectId: '', description: '', category: '', amount: '', expenseDate: '', supplier: '' });

  const fetchData = async () => {
    try {
      const [expRes, projRes] = await Promise.all([api('/construction/expenses?limit=100'), api('/construction/projects?limit=100')]);
      setExpenses(expRes.data || []); setProjects(projRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (editItem) { await api(`/construction/expenses/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/construction/expenses', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ projectId: item.projectId, description: item.description, category: item.category || '', amount: String(item.amount), expenseDate: item.expenseDate?.split('T')[0] || '', supplier: item.supplier || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta despesa?')) return;
    try { await api(`/construction/expenses/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'description', label: 'Descrição' },
    { key: 'project', label: 'Projeto', render: (item: any) => item.project?.name || '-' },
    { key: 'category', label: 'Categoria', render: (item: any) => item.category || '-' },
    { key: 'amount', label: 'Valor', render: (item: any) => formatCurrency(Number(item.amount)) },
    { key: 'expenseDate', label: 'Data', render: (item: any) => formatDate(item.expenseDate) },
    { key: 'supplier', label: 'Fornecedor', render: (item: any) => item.supplier || '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Despesas" subtitle="Gerencie as despesas dos projetos"
        action={<button onClick={() => { setEditItem(null); setForm({ projectId: '', description: '', category: '', amount: '', expenseDate: '', supplier: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Despesa</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={expenses} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Despesa' : 'Nova Despesa'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Projeto *</label>
            <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} className="input-field" required>
              <option value="">Selecione...</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Descrição *</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Categoria</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                <option value="">Selecione...</option><option value="material">Material</option><option value="mao_de_obra">Mão de Obra</option><option value="servico">Serviço</option><option value="equipamento">Equipamento</option><option value="outros">Outros</option>
              </select></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Valor (R$) *</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-field" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data *</label><input type="date" value={form.expenseDate} onChange={e => setForm({...form, expenseDate: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Fornecedor</label><input value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

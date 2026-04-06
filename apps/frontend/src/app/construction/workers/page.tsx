'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', dailyCost: '' });

  const fetchData = async () => {
    try { const res = await api('/construction/workers?limit=100'); setWorkers(res.data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, dailyCost: form.dailyCost ? parseFloat(form.dailyCost) : undefined };
      if (editItem) { await api(`/construction/workers/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/construction/workers', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name, email: item.email || '', phone: item.phone || '', role: item.role || '', dailyCost: item.dailyCost ? String(item.dailyCost) : '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este trabalhador?')) return;
    try { await api(`/construction/workers/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'role', label: 'Função', render: (item: any) => item.role || '-' },
    { key: 'phone', label: 'Telefone', render: (item: any) => item.phone || '-' },
    { key: 'email', label: 'Email', render: (item: any) => item.email || '-' },
    { key: 'dailyCost', label: 'Diária', render: (item: any) => item.dailyCost ? formatCurrency(Number(item.dailyCost)) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Equipe" subtitle="Gerencie os trabalhadores"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', email: '', phone: '', role: '', dailyCost: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Trabalhador</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={workers} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Trabalhador' : 'Novo Trabalhador'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Função</label><input value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input-field" placeholder="Ex: Pedreiro, Eletricista..." /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Diária (R$)</label><input type="number" step="0.01" value={form.dailyCost} onChange={e => setForm({...form, dailyCost: e.target.value})} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

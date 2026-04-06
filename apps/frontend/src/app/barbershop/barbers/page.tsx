'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialty: '', commission: '50' });

  const fetchData = async () => {
    try { const res = await api('/barbershop/barbers?limit=100'); setBarbers(res.data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, commission: parseFloat(form.commission) };
      if (editItem) { await api(`/barbershop/barbers/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/barbershop/barbers', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); setForm({ name: '', email: '', phone: '', specialty: '', commission: '50' }); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name, email: item.email || '', phone: item.phone || '', specialty: item.specialty || '', commission: String(item.commission || 50) });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este barbeiro?')) return;
    try { await api(`/barbershop/barbers/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'specialty', label: 'Especialidade', render: (item: any) => item.specialty || '-' },
    { key: 'phone', label: 'Telefone', render: (item: any) => item.phone || '-' },
    { key: 'email', label: 'Email', render: (item: any) => item.email || '-' },
    { key: 'commission', label: 'Comissão', render: (item: any) => `${item.commission || 50}%` },
    { key: 'isActive', label: 'Status', render: (item: any) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {item.isActive ? 'Ativo' : 'Inativo'}
      </span>
    )},
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Barbeiros" subtitle="Gerencie a equipe de barbeiros"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', email: '', phone: '', specialty: '', commission: '50' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Barbeiro</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={barbers} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Barbeiro' : 'Novo Barbeiro'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label><input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} className="input-field" placeholder="Corte, Barba, Coloração..." /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label><input type="number" min="0" max="100" value={form.commission} onChange={e => setForm({...form, commission: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

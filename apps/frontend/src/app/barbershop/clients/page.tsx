'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '', notes: '' });

  const fetchData = async () => {
    try {
      const query = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await api(`/barbershop/clients?limit=100${query}`);
      setClients(res.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, birthDate: form.birthDate || undefined };
      if (editItem) { await api(`/barbershop/clients/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/barbershop/clients', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); setForm({ name: '', phone: '', email: '', birthDate: '', notes: '' }); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name, phone: item.phone || '', email: item.email || '', birthDate: item.birthDate ? item.birthDate.substring(0, 10) : '', notes: item.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este cliente?')) return;
    try { await api(`/barbershop/clients/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'phone', label: 'Telefone', render: (item: any) => item.phone || '-' },
    { key: 'email', label: 'Email', render: (item: any) => item.email || '-' },
    { key: 'birthDate', label: 'Data de Nascimento', render: (item: any) => item.birthDate ? formatDate(item.birthDate) : '-' },
    { key: 'notes', label: 'Observações', render: (item: any) => item.notes ? (item.notes.length > 40 ? item.notes.substring(0, 40) + '...' : item.notes) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Clientes" subtitle="Gerencie a base de clientes"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', phone: '', email: '', birthDate: '', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Cliente</button>} />
      <div className="card">
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={clients} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" placeholder="(11) 99999-9999" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label><input type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={3} placeholder="Preferências, alergias, informações importantes..." /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

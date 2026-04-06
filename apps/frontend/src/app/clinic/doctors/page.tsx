'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', specialty: '', crm: '', phone: '' });

  const fetchData = async () => {
    try {
      const res = await api('/clinic/doctors?limit=100');
      setDoctors(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api(`/clinic/doctors/${editItem.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/clinic/doctors', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false); setEditItem(null); setForm({ name: '', email: '', specialty: '', crm: '', phone: '' });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name, email: item.email || '', specialty: item.specialty || '', crm: item.crm || '', phone: item.phone || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este médico?')) return;
    try { await api(`/clinic/doctors/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'specialty', label: 'Especialidade' },
    { key: 'crm', label: 'CRM' },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Médicos" subtitle="Gerencie os médicos da clínica" action={<button onClick={() => { setEditItem(null); setForm({ name: '', email: '', specialty: '', crm: '', phone: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Médico</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={doctors} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Médico' : 'Novo Médico'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label><input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">CRM</label><input value={form.crm} onChange={e => setForm({...form, crm: e.target.value})} className="input-field" /></div>
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

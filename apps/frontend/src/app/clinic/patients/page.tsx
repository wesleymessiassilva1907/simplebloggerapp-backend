'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', cpf: '', birthDate: '', phone: '', email: '', address: '', emergencyContact: '' });

  const fetchData = async () => {
    try {
      const res = await api('/clinic/patients?limit=100');
      setPatients(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api(`/clinic/patients/${editItem.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/clinic/patients', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ name: '', cpf: '', birthDate: '', phone: '', email: '', address: '', emergencyContact: '' });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name, cpf: item.cpf || '', birthDate: item.birthDate?.split('T')[0] || '', phone: item.phone || '', email: item.email || '', address: item.address || '', emergencyContact: item.emergencyContact || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este paciente?')) return;
    try {
      await api(`/clinic/patients/${item.id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'cpf', label: 'CPF' },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'Email' },
    { key: 'birthDate', label: 'Nascimento', render: (item: any) => item.birthDate ? formatDate(item.birthDate) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Pacientes"
        subtitle="Gerencie os pacientes da clínica"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', cpf: '', birthDate: '', phone: '', email: '', address: '', emergencyContact: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Paciente</button>}
      />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : (
          <DataTable columns={columns} data={patients} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Paciente' : 'Novo Paciente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contato de Emergência</label>
            <input value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

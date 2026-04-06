'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';

export default function DentalDentistsPage() {
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cro: '', specialty: '', isActive: true,
  });

  const emptyForm = { name: '', email: '', phone: '', cro: '', specialty: '', isActive: true };

  const fetchData = async () => {
    try {
      const res = await api('/dental/dentists?limit=100');
      setDentists(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api(`/dental/dentists/${editItem.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/dental/dentists', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false); setEditItem(null); setForm(emptyForm); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      name: item.name || '', email: item.email || '', phone: item.phone || '',
      cro: item.cro || '', specialty: item.specialty || '', isActive: item.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este dentista?')) return;
    try { await api(`/dental/dentists/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'specialty', label: 'Especialidade', render: (item: any) => item.specialty || '-' },
    { key: 'cro', label: 'CRO', render: (item: any) => item.cro || '-' },
    { key: 'phone', label: 'Telefone', render: (item: any) => item.phone || '-' },
    { key: 'email', label: 'Email', render: (item: any) => item.email || '-' },
    { key: 'isActive', label: 'Ativo', render: (item: any) => item.isActive ? 'Sim' : 'Não' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Dentistas" subtitle="Gerencie os dentistas da clínica"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Dentista</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={dentists} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Dentista' : 'Novo Dentista'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nome *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Telefone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">CRO *</label>
              <input value={form.cro} onChange={e => setForm({...form, cro: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Especialidade</label>
              <select value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} className="input-field">
                <option value="">Selecione...</option>
                <option value="clínico geral">Clínico Geral</option>
                <option value="ortodontia">Ortodontia</option>
                <option value="endodontia">Endodontia</option>
                <option value="implantodontia">Implantodontia</option>
                <option value="periodontia">Periodontia</option>
                <option value="odontopediatria">Odontopediatria</option>
              </select>
            </div>
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" />
              Ativo
            </label>
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

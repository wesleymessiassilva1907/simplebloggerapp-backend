'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function DentalPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '', birthDate: '',
    gender: '', address: '', emergencyContact: '', notes: '',
  });

  const emptyForm = { name: '', email: '', phone: '', cpf: '', birthDate: '', gender: '', address: '', emergencyContact: '', notes: '' };

  const fetchData = async () => {
    try {
      const res = await api('/dental/patients?limit=100');
      setPatients(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api(`/dental/patients/${editItem.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/dental/patients', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false); setEditItem(null); setForm(emptyForm); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      name: item.name || '', email: item.email || '', phone: item.phone || '', cpf: item.cpf || '',
      birthDate: item.birthDate?.split('T')[0] || '', gender: item.gender || '',
      address: item.address || '', emergencyContact: item.emergencyContact || '', notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este paciente?')) return;
    try { await api(`/dental/patients/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'phone', label: 'Telefone' },
    { key: 'cpf', label: 'CPF', render: (item: any) => item.cpf || '-' },
    { key: 'email', label: 'Email', render: (item: any) => item.email || '-' },
    { key: 'lastVisit', label: 'Última Visita', render: (item: any) => item.lastVisit ? formatDate(item.lastVisit) : '-' },
    { key: 'createdAt', label: 'Cadastro', render: (item: any) => item.createdAt ? formatDate(item.createdAt) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Pacientes Odontologia" subtitle="Gerencie os pacientes da clínica odontológica"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Paciente</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={patients} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Paciente' : 'Novo Paciente'}>
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
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">CPF</label>
              <input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data de Nascimento</label>
              <input type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Gênero</label>
            <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="input-field">
              <option value="">Selecione...</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Endereço</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Contato de Emergência</label>
            <input value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Observações</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={3} />
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

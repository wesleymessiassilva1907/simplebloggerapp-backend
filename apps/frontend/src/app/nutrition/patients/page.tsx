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

export default function NutritionPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', cpf: '', birthDate: '', gender: 'masculino', height: '', currentWeight: '', targetWeight: '', objective: 'emagrecimento', notes: '' });

  const fetchData = async () => {
    try { const res = await api('/nutrition/patients?limit=100'); setPatients(res.data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, height: form.height ? parseFloat(form.height) : undefined, currentWeight: form.currentWeight ? parseFloat(form.currentWeight) : undefined, targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : undefined };
      if (editItem) { await api(`/nutrition/patients/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/nutrition/patients', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name || '', email: item.email || '', phone: item.phone || '', cpf: item.cpf || '', birthDate: item.birthDate?.split('T')[0] || '', gender: item.gender || 'masculino', height: item.height ? String(item.height) : '', currentWeight: item.currentWeight ? String(item.currentWeight) : '', targetWeight: item.targetWeight ? String(item.targetWeight) : '', objective: item.objective || 'emagrecimento', notes: item.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este paciente?')) return;
    try { await api(`/nutrition/patients/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'phone', label: 'Telefone', render: (item: any) => item.phone || '-' },
    { key: 'currentWeight', label: 'Peso Atual', render: (item: any) => item.currentWeight ? `${item.currentWeight} kg` : '-' },
    { key: 'targetWeight', label: 'Peso Meta', render: (item: any) => item.targetWeight ? `${item.targetWeight} kg` : '-' },
    { key: 'objective', label: 'Objetivo', render: (item: any) => item.objective || '-' },
    { key: 'gender', label: 'Sexo', render: (item: any) => item.gender || '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Pacientes Nutrição" subtitle="Gerencie os pacientes de nutrição"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', email: '', phone: '', cpf: '', birthDate: '', gender: 'masculino', height: '', currentWeight: '', targetWeight: '', objective: 'emagrecimento', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Paciente</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={patients} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Paciente' : 'Novo Paciente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Telefone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">CPF</label><input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data de Nascimento</label><input type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Sexo</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="input-field">
                <option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="outro">Outro</option>
              </select></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Objetivo</label>
              <select value={form.objective} onChange={e => setForm({...form, objective: e.target.value})} className="input-field">
                <option value="emagrecimento">Emagrecimento</option><option value="ganho muscular">Ganho Muscular</option><option value="saúde">Saúde</option><option value="esporte">Esporte</option>
              </select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Altura (cm)</label><input type="number" step="0.1" value={form.height} onChange={e => setForm({...form, height: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Peso Atual (kg)</label><input type="number" step="0.1" value={form.currentWeight} onChange={e => setForm({...form, currentWeight: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Peso Meta (kg)</label><input type="number" step="0.1" value={form.targetWeight} onChange={e => setForm({...form, targetWeight: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

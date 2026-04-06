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

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ patientId: '', name: '', objective: '', dailyCalories: '', dailyProtein: '', dailyCarbs: '', dailyFat: '', startDate: '', endDate: '', status: 'ativo', notes: '' });

  const fetchData = async () => {
    try {
      const [plansRes, patientsRes] = await Promise.all([
        api('/nutrition/plans?limit=100'),
        api('/nutrition/patients?limit=100'),
      ]);
      setPlans(plansRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, dailyCalories: form.dailyCalories ? parseInt(form.dailyCalories) : undefined, dailyProtein: form.dailyProtein ? parseFloat(form.dailyProtein) : undefined, dailyCarbs: form.dailyCarbs ? parseFloat(form.dailyCarbs) : undefined, dailyFat: form.dailyFat ? parseFloat(form.dailyFat) : undefined };
      if (editItem) { await api(`/nutrition/plans/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/nutrition/plans', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ patientId: item.patientId || '', name: item.name || '', objective: item.objective || '', dailyCalories: item.dailyCalories ? String(item.dailyCalories) : '', dailyProtein: item.dailyProtein ? String(item.dailyProtein) : '', dailyCarbs: item.dailyCarbs ? String(item.dailyCarbs) : '', dailyFat: item.dailyFat ? String(item.dailyFat) : '', startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '', status: item.status || 'ativo', notes: item.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este plano?')) return;
    try { await api(`/nutrition/plans/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || '-';

  const columns = [
    { key: 'name', label: 'Plano' },
    { key: 'patientId', label: 'Paciente', render: (item: any) => item.patient?.name || getPatientName(item.patientId) },
    { key: 'dailyCalories', label: 'Calorias/dia', render: (item: any) => item.dailyCalories ? `${item.dailyCalories} kcal` : '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'startDate', label: 'Início', render: (item: any) => item.startDate ? formatDate(item.startDate) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Planos Nutricionais" subtitle="Gerencie os planos nutricionais dos pacientes"
        action={<button onClick={() => { setEditItem(null); setForm({ patientId: '', name: '', objective: '', dailyCalories: '', dailyProtein: '', dailyCarbs: '', dailyFat: '', startDate: '', endDate: '', status: 'ativo', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Plano</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={plans} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Plano' : 'Novo Plano'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Paciente *</label>
            <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field" required>
              <option value="">Selecione um paciente</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nome do Plano *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Objetivo</label><input value={form.objective} onChange={e => setForm({...form, objective: e.target.value})} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Calorias Diárias (kcal)</label><input type="number" value={form.dailyCalories} onChange={e => setForm({...form, dailyCalories: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Proteínas (g)</label><input type="number" step="0.1" value={form.dailyProtein} onChange={e => setForm({...form, dailyProtein: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Carboidratos (g)</label><input type="number" step="0.1" value={form.dailyCarbs} onChange={e => setForm({...form, dailyCarbs: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Gorduras (g)</label><input type="number" step="0.1" value={form.dailyFat} onChange={e => setForm({...form, dailyFat: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data Início</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data Fim</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
              <option value="ativo">Ativo</option><option value="finalizado">Finalizado</option><option value="pausado">Pausado</option>
            </select></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

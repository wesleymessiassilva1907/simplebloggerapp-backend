'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function NutritionAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ patientId: '', appointmentDate: '', type: 'consulta', status: 'agendada', weight: '', notes: '', recommendations: '' });

  const fetchData = async () => {
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        api('/nutrition/appointments?limit=100'),
        api('/nutrition/patients?limit=100'),
      ]);
      setAppointments(appointmentsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, weight: form.weight ? parseFloat(form.weight) : undefined };
      if (editItem) { await api(`/nutrition/appointments/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/nutrition/appointments', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ patientId: item.patientId || '', appointmentDate: item.appointmentDate ? item.appointmentDate.substring(0, 16) : '', type: item.type || 'consulta', status: item.status || 'agendada', weight: item.weight ? String(item.weight) : '', notes: item.notes || '', recommendations: item.recommendations || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta consulta?')) return;
    try { await api(`/nutrition/appointments/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || '-';

  const columns = [
    { key: 'patientId', label: 'Paciente', render: (item: any) => item.patient?.name || getPatientName(item.patientId) },
    { key: 'appointmentDate', label: 'Data/Hora', render: (item: any) => item.appointmentDate ? formatDateTime(item.appointmentDate) : '-' },
    { key: 'type', label: 'Tipo', render: (item: any) => item.type || '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'weight', label: 'Peso', render: (item: any) => item.weight ? `${item.weight} kg` : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Consultas Nutrição" subtitle="Gerencie as consultas de nutrição"
        action={<button onClick={() => { setEditItem(null); setForm({ patientId: '', appointmentDate: '', type: 'consulta', status: 'agendada', weight: '', notes: '', recommendations: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Consulta</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={appointments} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Consulta' : 'Nova Consulta'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
            <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field" required>
              <option value="">Selecione um paciente</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora *</label><input type="datetime-local" value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                <option value="consulta">Consulta</option><option value="retorno">Retorno</option><option value="avaliação">Avaliação</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="agendada">Agendada</option><option value="confirmada">Confirmada</option><option value="realizada">Realizada</option><option value="cancelada">Cancelada</option><option value="não compareceu">Não Compareceu</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label><input type="number" step="0.1" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Recomendações</label><textarea value={form.recommendations} onChange={e => setForm({...form, recommendations: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

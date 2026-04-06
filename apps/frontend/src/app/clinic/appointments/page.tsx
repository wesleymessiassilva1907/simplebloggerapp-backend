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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentDate: '', status: 'scheduled', notes: '' });

  const fetchData = async () => {
    try {
      const [apptRes, patRes, docRes] = await Promise.all([
        api('/clinic/appointments?limit=100'),
        api('/clinic/patients?limit=100'),
        api('/clinic/doctors?limit=100'),
      ]);
      setAppointments(apptRes.data || []);
      setPatients(patRes.data || []);
      setDoctors(docRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api(`/clinic/appointments/${editItem.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/clinic/appointments', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ patientId: item.patientId, doctorId: item.doctorId, appointmentDate: item.appointmentDate?.slice(0, 16) || '', status: item.status, notes: item.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta consulta?')) return;
    try { await api(`/clinic/appointments/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'appointmentDate', label: 'Data/Hora', render: (item: any) => formatDateTime(item.appointmentDate) },
    { key: 'patient', label: 'Paciente', render: (item: any) => item.patient?.name || '-' },
    { key: 'doctor', label: 'Médico', render: (item: any) => item.doctor?.name || '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'notes', label: 'Observações', render: (item: any) => item.notes ? (item.notes.length > 40 ? item.notes.slice(0, 40) + '...' : item.notes) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Agenda de Consultas" subtitle="Gerencie as consultas e agendamentos"
        action={<button onClick={() => { setEditItem(null); setForm({ patientId: '', doctorId: '', appointmentDate: '', status: 'scheduled', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Consulta</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={appointments} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Consulta' : 'Nova Consulta'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
            <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field" required>
              <option value="">Selecione...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Médico *</label>
            <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="input-field" required>
              <option value="">Selecione...</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora *</label><input type="datetime-local" value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="scheduled">Agendado</option><option value="confirmed">Confirmado</option><option value="in_progress">Em Andamento</option><option value="completed">Concluído</option><option value="canceled">Cancelado</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={3} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Agendar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

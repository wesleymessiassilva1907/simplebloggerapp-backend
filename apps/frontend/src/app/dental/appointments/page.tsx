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

export default function DentalAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    patientId: '', dentistId: '', appointmentDate: '', duration: '',
    type: 'consulta', status: 'agendado', toothNumber: '', notes: '', clinicalNotes: '',
  });

  const emptyForm = { patientId: '', dentistId: '', appointmentDate: '', duration: '', type: 'consulta', status: 'agendado', toothNumber: '', notes: '', clinicalNotes: '' };

  const fetchData = async () => {
    try {
      const [apptRes, patRes, dentRes] = await Promise.all([
        api('/dental/appointments?limit=100'),
        api('/dental/patients?limit=100'),
        api('/dental/dentists?limit=100'),
      ]);
      setAppointments(apptRes.data || []);
      setPatients(patRes.data || []);
      setDentists(dentRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, duration: form.duration ? parseInt(form.duration) : null };
      if (editItem) {
        await api(`/dental/appointments/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await api('/dental/appointments', { method: 'POST', body: JSON.stringify(data) });
      }
      setShowModal(false); setEditItem(null); setForm(emptyForm); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      patientId: item.patientId || '', dentistId: item.dentistId || '',
      appointmentDate: item.appointmentDate ? item.appointmentDate.slice(0, 16) : '',
      duration: item.duration ? String(item.duration) : '', type: item.type || 'consulta',
      status: item.status || 'agendado', toothNumber: item.toothNumber || '',
      notes: item.notes || '', clinicalNotes: item.clinicalNotes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este agendamento?')) return;
    try { await api(`/dental/appointments/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'patient', label: 'Paciente', render: (item: any) => item.patient?.name || '-' },
    { key: 'dentist', label: 'Dentista', render: (item: any) => item.dentist?.name || '-' },
    { key: 'appointmentDate', label: 'Data/Hora', render: (item: any) => item.appointmentDate ? formatDateTime(item.appointmentDate) : '-' },
    { key: 'type', label: 'Tipo', render: (item: any) => item.type || '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'toothNumber', label: 'Dente', render: (item: any) => item.toothNumber || '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Agenda Odontológica" subtitle="Gerencie os agendamentos da clínica odontológica"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Agendamento</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={appointments} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Agendamento' : 'Novo Agendamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Paciente *</label>
              <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field" required>
                <option value="">Selecione...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Dentista *</label>
              <select value={form.dentistId} onChange={e => setForm({...form, dentistId: e.target.value})} className="input-field" required>
                <option value="">Selecione...</option>
                {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data e Hora *</label>
              <input type="datetime-local" value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Duração (minutos)</label>
              <input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tipo</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                <option value="consulta">Consulta</option>
                <option value="tratamento">Tratamento</option>
                <option value="retorno">Retorno</option>
                <option value="emergência">Emergência</option>
                <option value="limpeza">Limpeza</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="em andamento">Em Andamento</option>
                <option value="concluído">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Número do Dente</label>
            <input value={form.toothNumber} onChange={e => setForm({...form, toothNumber: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Observações</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notas Clínicas</label>
            <textarea value={form.clinicalNotes} onChange={e => setForm({...form, clinicalNotes: e.target.value})} className="input-field" rows={3} />
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

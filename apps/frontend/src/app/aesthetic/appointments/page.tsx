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

export default function AestheticAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    clientId: '', procedureId: '', appointmentDate: '', sessionNumber: '',
    status: 'agendado', professional: '', notes: '',
  });

  const emptyForm = { clientId: '', procedureId: '', appointmentDate: '', sessionNumber: '', status: 'agendado', professional: '', notes: '' };

  const fetchData = async () => {
    try {
      const [apptRes, clientRes, procRes] = await Promise.all([
        api('/aesthetic/appointments?limit=100'),
        api('/aesthetic/clients?limit=100'),
        api('/aesthetic/procedures?limit=100'),
      ]);
      setAppointments(apptRes.data || []);
      setClients(clientRes.data || []);
      setProcedures(procRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, sessionNumber: form.sessionNumber ? parseInt(form.sessionNumber) : null };
      if (editItem) {
        await api(`/aesthetic/appointments/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await api('/aesthetic/appointments', { method: 'POST', body: JSON.stringify(data) });
      }
      setShowModal(false); setEditItem(null); setForm(emptyForm); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      clientId: item.clientId || '', procedureId: item.procedureId || '',
      appointmentDate: item.appointmentDate ? item.appointmentDate.slice(0, 16) : '',
      sessionNumber: item.sessionNumber ? String(item.sessionNumber) : '',
      status: item.status || 'agendado', professional: item.professional || '', notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este agendamento?')) return;
    try { await api(`/aesthetic/appointments/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'client', label: 'Cliente', render: (item: any) => item.client?.name || '-' },
    { key: 'procedure', label: 'Procedimento', render: (item: any) => item.procedure?.name || '-' },
    { key: 'appointmentDate', label: 'Data/Hora', render: (item: any) => item.appointmentDate ? formatDateTime(item.appointmentDate) : '-' },
    { key: 'sessionNumber', label: 'Sessão', render: (item: any) => item.sessionNumber || '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'professional', label: 'Profissional', render: (item: any) => item.professional || '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Agendamentos Estética" subtitle="Gerencie os agendamentos da clínica estética"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Agendamento</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={appointments} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Agendamento' : 'Novo Agendamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Cliente *</label>
              <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="input-field" required>
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Procedimento *</label>
              <select value={form.procedureId} onChange={e => setForm({...form, procedureId: e.target.value})} className="input-field" required>
                <option value="">Selecione...</option>
                {procedures.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data e Hora *</label>
              <input type="datetime-local" value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Número da Sessão</label>
              <input type="number" value={form.sessionNumber} onChange={e => setForm({...form, sessionNumber: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Profissional</label>
              <input value={form.professional} onChange={e => setForm({...form, professional: e.target.value})} className="input-field" />
            </div>
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

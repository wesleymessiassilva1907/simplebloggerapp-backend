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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ clientId: '', barberId: '', bookingDate: '', status: 'agendado', notes: '' });

  const fetchData = async () => {
    try {
      const [bookingsRes, clientsRes, barbersRes] = await Promise.all([
        api('/barbershop/bookings?limit=100'),
        api('/barbershop/clients?limit=100'),
        api('/barbershop/barbers?limit=100'),
      ]);
      setBookings(bookingsRes.data || []);
      setClients(clientsRes.data || []);
      setBarbers(barbersRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (editItem) { await api(`/barbershop/bookings/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/barbershop/bookings', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); setForm({ clientId: '', barberId: '', bookingDate: '', status: 'agendado', notes: '' }); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      clientId: item.clientId || '',
      barberId: item.barberId || '',
      bookingDate: item.bookingDate ? item.bookingDate.substring(0, 16) : '',
      status: item.status || 'agendado',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este agendamento?')) return;
    try { await api(`/barbershop/bookings/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const statusLabels: Record<string, string> = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    em_atendimento: 'Em Atendimento',
    concluído: 'Concluído',
    cancelado: 'Cancelado',
    'não_compareceu': 'Não Compareceu',
  };

  const statusColors: Record<string, string> = {
    agendado: 'bg-blue-100 text-blue-700',
    confirmado: 'bg-cyan-100 text-cyan-700',
    em_atendimento: 'bg-yellow-100 text-yellow-700',
    concluído: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
    'não_compareceu': 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || '-';
  const getBarberName = (id: string) => barbers.find(b => b.id === id)?.name || '-';

  const columns = [
    { key: 'bookingDate', label: 'Data/Hora', render: (item: any) => item.bookingDate ? formatDateTime(item.bookingDate) : '-' },
    { key: 'clientId', label: 'Cliente', render: (item: any) => item.client?.name || getClientName(item.clientId) },
    { key: 'barberId', label: 'Barbeiro', render: (item: any) => item.barber?.name || getBarberName(item.barberId) },
    { key: 'status', label: 'Status', render: (item: any) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
        {statusLabels[item.status] || item.status}
      </span>
    )},
    { key: 'notes', label: 'Observações', render: (item: any) => item.notes ? (item.notes.length > 30 ? item.notes.substring(0, 30) + '...' : item.notes) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Agendamentos" subtitle="Gerencie os agendamentos da barbearia"
        action={<button onClick={() => { setEditItem(null); setForm({ clientId: '', barberId: '', bookingDate: '', status: 'agendado', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Agendamento</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={bookings} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Agendamento' : 'Novo Agendamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Cliente *</label>
            <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="input-field" required>
              <option value="">Selecione um cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Barbeiro *</label>
            <select value={form.barberId} onChange={e => setForm({...form, barberId: e.target.value})} className="input-field" required>
              <option value="">Selecione um barbeiro</option>
              {barbers.filter(b => b.isActive !== false).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Data e Hora *</label><input type="datetime-local" value={form.bookingDate} onChange={e => setForm({...form, bookingDate: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status *</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="concluído">Concluído</option>
                <option value="cancelado">Cancelado</option>
                <option value="não_compareceu">Não Compareceu</option>
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Agendar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

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

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ propertyId: '', clientId: '', visitDate: '', status: 'agendada', feedback: '', rating: '', notes: '' });

  const fetchData = async () => {
    try {
      const [visitsRes, propertiesRes, clientsRes] = await Promise.all([
        api('/realestate/visits?limit=100'),
        api('/realestate/properties?limit=100'),
        api('/realestate/clients?limit=100'),
      ]);
      setVisits(visitsRes.data || []);
      setProperties(propertiesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, rating: form.rating ? parseInt(form.rating) : undefined };
      if (editItem) { await api(`/realestate/visits/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/realestate/visits', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ propertyId: item.propertyId || '', clientId: item.clientId || '', visitDate: item.visitDate ? item.visitDate.substring(0, 16) : '', status: item.status || 'agendada', feedback: item.feedback || '', rating: item.rating ? String(item.rating) : '', notes: item.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta visita?')) return;
    try { await api(`/realestate/visits/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const getPropertyTitle = (id: string) => properties.find(p => p.id === id)?.title || '-';
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || '-';

  const columns = [
    { key: 'propertyId', label: 'Imóvel', render: (item: any) => item.property?.title || getPropertyTitle(item.propertyId) },
    { key: 'clientId', label: 'Cliente', render: (item: any) => item.client?.name || getClientName(item.clientId) },
    { key: 'visitDate', label: 'Data/Hora', render: (item: any) => item.visitDate ? formatDateTime(item.visitDate) : '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'rating', label: 'Avaliação', render: (item: any) => item.rating ? `${item.rating}/5` : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Visitas" subtitle="Gerencie as visitas aos imóveis"
        action={<button onClick={() => { setEditItem(null); setForm({ propertyId: '', clientId: '', visitDate: '', status: 'agendada', feedback: '', rating: '', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Visita</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={visits} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Visita' : 'Nova Visita'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Imóvel *</label>
            <select value={form.propertyId} onChange={e => setForm({...form, propertyId: e.target.value})} className="input-field" required>
              <option value="">Selecione um imóvel</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="input-field" required>
              <option value="">Selecione um cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora *</label><input type="datetime-local" value={form.visitDate} onChange={e => setForm({...form, visitDate: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="agendada">Agendada</option><option value="realizada">Realizada</option><option value="cancelada">Cancelada</option><option value="não compareceu">Não Compareceu</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label><textarea value={form.feedback} onChange={e => setForm({...form, feedback: e.target.value})} className="input-field" rows={2} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Avaliação (1-5)</label><input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ propertyId: '', clientId: '', type: 'venda', value: '', commissionPercent: '', status: 'negociação', notes: '' });

  const fetchData = async () => {
    try {
      const [dealsRes, propertiesRes, clientsRes] = await Promise.all([
        api('/realestate/deals?limit=100'),
        api('/realestate/properties?limit=100'),
        api('/realestate/clients?limit=100'),
      ]);
      setDeals(dealsRes.data || []);
      setProperties(propertiesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, value: form.value ? parseFloat(form.value) : undefined, commissionPercent: form.commissionPercent ? parseFloat(form.commissionPercent) : undefined };
      if (editItem) { await api(`/realestate/deals/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/realestate/deals', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ propertyId: item.propertyId || '', clientId: item.clientId || '', type: item.type || 'venda', value: item.value ? String(item.value) : '', commissionPercent: item.commissionPercent ? String(item.commissionPercent) : '', status: item.status || 'negociação', notes: item.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este negócio?')) return;
    try { await api(`/realestate/deals/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const getPropertyTitle = (id: string) => properties.find(p => p.id === id)?.title || '-';
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || '-';

  const columns = [
    { key: 'propertyId', label: 'Imóvel', render: (item: any) => item.property?.title || getPropertyTitle(item.propertyId) },
    { key: 'clientId', label: 'Cliente', render: (item: any) => item.client?.name || getClientName(item.clientId) },
    { key: 'type', label: 'Tipo', render: (item: any) => item.type === 'venda' ? 'Venda' : 'Aluguel' },
    { key: 'value', label: 'Valor', render: (item: any) => item.value ? formatCurrency(Number(item.value)) : '-' },
    { key: 'commissionPercent', label: 'Comissão', render: (item: any) => item.commissionPercent ? `${item.commissionPercent}%` : '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Negócios" subtitle="Gerencie os negócios imobiliários"
        action={<button onClick={() => { setEditItem(null); setForm({ propertyId: '', clientId: '', type: 'venda', value: '', commissionPercent: '', status: 'negociação', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Negócio</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={deals} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Negócio' : 'Novo Negócio'}>
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
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                <option value="venda">Venda</option><option value="aluguel">Aluguel</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="negociação">Negociação</option><option value="proposta">Proposta</option><option value="contrato">Contrato</option><option value="fechado">Fechado</option><option value="cancelado">Cancelado</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label><input type="number" step="0.01" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label><input type="number" step="0.01" value={form.commissionPercent} onChange={e => setForm({...form, commissionPercent: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

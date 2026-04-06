'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ clientId: '', barberId: '', totalAmount: '', paymentMethod: 'PIX', status: 'pendente' });

  const fetchData = async () => {
    try {
      const [ordersRes, clientsRes, barbersRes] = await Promise.all([
        api('/barbershop/orders?limit=100'),
        api('/barbershop/clients?limit=100'),
        api('/barbershop/barbers?limit=100'),
      ]);
      setOrders(ordersRes.data || []);
      setClients(clientsRes.data || []);
      setBarbers(barbersRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, totalAmount: parseFloat(form.totalAmount) };
      if (editItem) { await api(`/barbershop/orders/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/barbershop/orders', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); setForm({ clientId: '', barberId: '', totalAmount: '', paymentMethod: 'PIX', status: 'pendente' }); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      clientId: item.clientId || '',
      barberId: item.barberId || '',
      totalAmount: String(item.totalAmount || ''),
      paymentMethod: item.paymentMethod || 'PIX',
      status: item.status || 'pendente',
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta comanda?')) return;
    try { await api(`/barbershop/orders/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const statusLabels: Record<string, string> = { pendente: 'Pendente', pago: 'Pago', cancelado: 'Cancelado' };
  const statusColors: Record<string, string> = { pendente: 'bg-yellow-100 text-yellow-700', pago: 'bg-green-100 text-green-700', cancelado: 'bg-red-100 text-red-700' };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || '-';
  const getBarberName = (id: string) => barbers.find(b => b.id === id)?.name || '-';

  const columns = [
    { key: 'createdAt', label: 'Data', render: (item: any) => item.createdAt ? formatDateTime(item.createdAt) : '-' },
    { key: 'clientId', label: 'Cliente', render: (item: any) => item.client?.name || getClientName(item.clientId) },
    { key: 'barberId', label: 'Barbeiro', render: (item: any) => item.barber?.name || getBarberName(item.barberId) },
    { key: 'totalAmount', label: 'Total', render: (item: any) => formatCurrency(item.totalAmount) },
    { key: 'paymentMethod', label: 'Pagamento', render: (item: any) => item.paymentMethod || '-' },
    { key: 'status', label: 'Status', render: (item: any) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
        {statusLabels[item.status] || item.status}
      </span>
    )},
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Comandas" subtitle="Gerencie as comandas e pagamentos"
        action={<button onClick={() => { setEditItem(null); setForm({ clientId: '', barberId: '', totalAmount: '', paymentMethod: 'PIX', status: 'pendente' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Comanda</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={orders} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Comanda' : 'Nova Comanda'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="input-field" required>
              <option value="">Selecione um cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Barbeiro *</label>
            <select value={form.barberId} onChange={e => setForm({...form, barberId: e.target.value})} className="input-field" required>
              <option value="">Selecione um barbeiro</option>
              {barbers.filter(b => b.isActive !== false).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Total (R$) *</label><input type="number" step="0.01" min="0" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Pagamento *</label>
              <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="input-field">
                <option value="PIX">PIX</option>
                <option value="Cartão Crédito">Cartão Crédito</option>
                <option value="Cartão Débito">Cartão Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

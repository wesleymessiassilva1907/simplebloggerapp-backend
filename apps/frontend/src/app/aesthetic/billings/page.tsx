'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function AestheticBillingsPage() {
  const [billings, setBillings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    clientId: '', description: '', amount: '', status: 'pendente',
    paymentMethod: '', installments: '', dueDate: '',
  });

  const emptyForm = { clientId: '', description: '', amount: '', status: 'pendente', paymentMethod: '', installments: '', dueDate: '' };

  const fetchData = async () => {
    try {
      const [billRes, clientRes] = await Promise.all([
        api('/aesthetic/billings?limit=100'),
        api('/aesthetic/clients?limit=100'),
      ]);
      setBillings(billRes.data || []);
      setClients(clientRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        amount: form.amount ? parseFloat(form.amount) : null,
        installments: form.installments ? parseInt(form.installments) : null,
      };
      if (editItem) {
        await api(`/aesthetic/billings/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await api('/aesthetic/billings', { method: 'POST', body: JSON.stringify(data) });
      }
      setShowModal(false); setEditItem(null); setForm(emptyForm); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      clientId: item.clientId || '', description: item.description || '',
      amount: item.amount ? String(item.amount) : '', status: item.status || 'pendente',
      paymentMethod: item.paymentMethod || '',
      installments: item.installments ? String(item.installments) : '',
      dueDate: item.dueDate?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta cobrança?')) return;
    try { await api(`/aesthetic/billings/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'description', label: 'Descrição', render: (item: any) => item.description || '-' },
    { key: 'client', label: 'Cliente', render: (item: any) => item.client?.name || '-' },
    { key: 'amount', label: 'Valor', render: (item: any) => item.amount ? formatCurrency(Number(item.amount)) : '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'paymentMethod', label: 'Forma Pgto', render: (item: any) => item.paymentMethod || '-' },
    { key: 'dueDate', label: 'Vencimento', render: (item: any) => item.dueDate ? formatDate(item.dueDate) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Financeiro Estética" subtitle="Gerencie o financeiro da clínica estética"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Cobrança</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={billings} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Cobrança' : 'Nova Cobrança'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Cliente *</label>
            <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="input-field" required>
              <option value="">Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Descrição</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Valor (R$) *</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="vencido">Vencido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Forma de Pagamento</label>
              <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="input-field">
                <option value="">Selecione...</option>
                <option value="PIX">PIX</option>
                <option value="Cartão Crédito">Cartão Crédito</option>
                <option value="Cartão Débito">Cartão Débito</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Parcelas</label>
              <input type="number" value={form.installments} onChange={e => setForm({...form, installments: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Vencimento</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input-field" />
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

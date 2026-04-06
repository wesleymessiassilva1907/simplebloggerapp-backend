'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function ClinicBillingPage() {
  const [billings, setBillings] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ patientId: '', amount: '', status: 'pending', paymentMethod: '', dueDate: '' });

  const fetchData = async () => {
    try {
      const [billRes, patRes] = await Promise.all([
        api('/clinic/billing?limit=100'),
        api('/clinic/patients?limit=100'),
      ]);
      setBillings(billRes.data || []);
      setPatients(patRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (editItem) {
        await api(`/clinic/billing/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await api('/clinic/billing', { method: 'POST', body: JSON.stringify(data) });
      }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ patientId: item.patientId, amount: String(item.amount), status: item.status, paymentMethod: item.paymentMethod || '', dueDate: item.dueDate?.split('T')[0] || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta fatura?')) return;
    try { await api(`/clinic/billing/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'patient', label: 'Paciente', render: (item: any) => item.patient?.name || '-' },
    { key: 'amount', label: 'Valor', render: (item: any) => formatCurrency(Number(item.amount)) },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'paymentMethod', label: 'Forma Pgto', render: (item: any) => item.paymentMethod || '-' },
    { key: 'dueDate', label: 'Vencimento', render: (item: any) => item.dueDate ? formatDate(item.dueDate) : '-' },
    { key: 'paidAt', label: 'Pago em', render: (item: any) => item.paidAt ? formatDate(item.paidAt) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Faturamento" subtitle="Gerencie as faturas da clínica"
        action={<button onClick={() => { setEditItem(null); setForm({ patientId: '', amount: '', status: 'pending', paymentMethod: '', dueDate: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Fatura</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={billings} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Fatura' : 'Nova Fatura'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
            <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field" required>
              <option value="">Selecione...</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="pending">Pendente</option><option value="paid">Pago</option><option value="overdue">Vencido</option><option value="canceled">Cancelado</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
              <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="input-field">
                <option value="">Selecione...</option><option value="pix">PIX</option><option value="credit_card">Cartão de Crédito</option><option value="debit_card">Cartão de Débito</option><option value="cash">Dinheiro</option><option value="boleto">Boleto</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label><input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

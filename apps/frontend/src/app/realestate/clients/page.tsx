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

export default function RealEstateClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', cpf: '', type: 'comprador', budget: '', source: 'indicação', status: 'ativo', notes: '' });

  const fetchData = async () => {
    try { const res = await api('/realestate/clients?limit=100'); setClients(res.data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, budget: form.budget ? parseFloat(form.budget) : undefined };
      if (editItem) { await api(`/realestate/clients/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/realestate/clients', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name || '', email: item.email || '', phone: item.phone || '', cpf: item.cpf || '', type: item.type || 'comprador', budget: item.budget ? String(item.budget) : '', source: item.source || 'indicação', status: item.status || 'ativo', notes: item.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este cliente?')) return;
    try { await api(`/realestate/clients/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'type', label: 'Tipo' },
    { key: 'phone', label: 'Telefone', render: (item: any) => item.phone || '-' },
    { key: 'email', label: 'Email', render: (item: any) => item.email || '-' },
    { key: 'budget', label: 'Orçamento', render: (item: any) => item.budget ? formatCurrency(Number(item.budget)) : '-' },
    { key: 'source', label: 'Origem', render: (item: any) => item.source || '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Clientes Imobiliária" subtitle="Gerencie os clientes da imobiliária"
        action={<button onClick={() => { setEditItem(null); setForm({ name: '', email: '', phone: '', cpf: '', type: 'comprador', budget: '', source: 'indicação', status: 'ativo', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Cliente</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={clients} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">CPF</label><input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                <option value="comprador">Comprador</option><option value="vendedor">Vendedor</option><option value="investidor">Investidor</option><option value="locatário">Locatário</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Orçamento (R$)</label><input type="number" step="0.01" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="input-field">
                <option value="indicação">Indicação</option><option value="site">Site</option><option value="instagram">Instagram</option><option value="evento">Evento</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
              <option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="negociando">Negociando</option>
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

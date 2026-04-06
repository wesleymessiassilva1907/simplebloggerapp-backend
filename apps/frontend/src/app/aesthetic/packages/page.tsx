'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function AestheticPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', description: '', totalPrice: '', totalSessions: '',
    validityDays: '', discount: '', isActive: true,
  });

  const emptyForm = { name: '', description: '', totalPrice: '', totalSessions: '', validityDays: '', discount: '', isActive: true };

  const fetchData = async () => {
    try {
      const res = await api('/aesthetic/packages?limit=100');
      setPackages(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        totalPrice: form.totalPrice ? parseFloat(form.totalPrice) : null,
        totalSessions: form.totalSessions ? parseInt(form.totalSessions) : null,
        validityDays: form.validityDays ? parseInt(form.validityDays) : null,
        discount: form.discount ? parseFloat(form.discount) : null,
      };
      if (editItem) {
        await api(`/aesthetic/packages/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await api('/aesthetic/packages', { method: 'POST', body: JSON.stringify(data) });
      }
      setShowModal(false); setEditItem(null); setForm(emptyForm); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      name: item.name || '', description: item.description || '',
      totalPrice: item.totalPrice ? String(item.totalPrice) : '',
      totalSessions: item.totalSessions ? String(item.totalSessions) : '',
      validityDays: item.validityDays ? String(item.validityDays) : '',
      discount: item.discount ? String(item.discount) : '',
      isActive: item.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este pacote?')) return;
    try { await api(`/aesthetic/packages/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'totalPrice', label: 'Preço Total', render: (item: any) => item.totalPrice ? formatCurrency(Number(item.totalPrice)) : '-' },
    { key: 'totalSessions', label: 'Total Sessões', render: (item: any) => item.totalSessions || '-' },
    { key: 'validityDays', label: 'Validade (dias)', render: (item: any) => item.validityDays || '-' },
    { key: 'discount', label: 'Desconto (%)', render: (item: any) => item.discount ? `${item.discount}%` : '-' },
    { key: 'isActive', label: 'Ativo', render: (item: any) => item.isActive ? 'Sim' : 'Não' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Pacotes" subtitle="Gerencie os pacotes de procedimentos"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Pacote</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={packages} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Pacote' : 'Novo Pacote'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Total (R$)</label>
              <input type="number" step="0.01" value={form.totalPrice} onChange={e => setForm({...form, totalPrice: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total de Sessões</label>
              <input type="number" value={form.totalSessions} onChange={e => setForm({...form, totalSessions: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validade (dias)</label>
              <input type="number" value={form.validityDays} onChange={e => setForm({...form, validityDays: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (%)</label>
              <input type="number" step="0.01" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" />
              Ativo
            </label>
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

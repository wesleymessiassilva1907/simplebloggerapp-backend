'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function DentalTreatmentsPage() {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', description: '', category: '', duration: '', price: '',
    toothRelated: false, isActive: true,
  });

  const emptyForm = { name: '', description: '', category: '', duration: '', price: '', toothRelated: false, isActive: true };

  const fetchData = async () => {
    try {
      const res = await api('/dental/treatments?limit=100');
      setTreatments(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        duration: form.duration ? parseInt(form.duration) : null,
        price: form.price ? parseFloat(form.price) : null,
      };
      if (editItem) {
        await api(`/dental/treatments/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await api('/dental/treatments', { method: 'POST', body: JSON.stringify(data) });
      }
      setShowModal(false); setEditItem(null); setForm(emptyForm); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      name: item.name || '', description: item.description || '', category: item.category || '',
      duration: item.duration ? String(item.duration) : '', price: item.price ? String(item.price) : '',
      toothRelated: item.toothRelated || false, isActive: item.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este tratamento?')) return;
    try { await api(`/dental/treatments/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'category', label: 'Categoria', render: (item: any) => item.category || '-' },
    { key: 'duration', label: 'Duração (min)', render: (item: any) => item.duration ? `${item.duration} min` : '-' },
    { key: 'price', label: 'Preço', render: (item: any) => item.price ? formatCurrency(Number(item.price)) : '-' },
    { key: 'toothRelated', label: 'Relacionado a Dente', render: (item: any) => item.toothRelated ? 'Sim' : 'Não' },
    { key: 'isActive', label: 'Ativo', render: (item: any) => item.isActive ? 'Sim' : 'Não' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Tratamentos Odontológicos" subtitle="Gerencie os tratamentos da clínica odontológica"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Tratamento</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={treatments} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Tratamento' : 'Novo Tratamento'}>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                <option value="">Selecione...</option>
                <option value="preventivo">Preventivo</option>
                <option value="restaurador">Restaurador</option>
                <option value="estético">Estético</option>
                <option value="ortodôntico">Ortodôntico</option>
                <option value="cirúrgico">Cirúrgico</option>
                <option value="endodôntico">Endodôntico</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos)</label>
              <input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
            <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={form.toothRelated} onChange={e => setForm({...form, toothRelated: e.target.checked})} className="rounded" />
              Relacionado a Dente
            </label>
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

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ title: '', type: 'apartamento', status: 'disponível', price: '', area: '', bedrooms: '', bathrooms: '', parkingSpots: '', address: '', neighborhood: '', city: '' });

  const fetchData = async () => {
    try { const res = await api('/realestate/properties?limit=100'); setProperties(res.data || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, price: form.price ? parseFloat(form.price) : undefined, area: form.area ? parseFloat(form.area) : undefined, bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined, bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined, parkingSpots: form.parkingSpots ? parseInt(form.parkingSpots) : undefined };
      if (editItem) { await api(`/realestate/properties/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/realestate/properties', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ title: item.title || '', type: item.type || 'apartamento', status: item.status || 'disponível', price: item.price ? String(item.price) : '', area: item.area ? String(item.area) : '', bedrooms: item.bedrooms ? String(item.bedrooms) : '', bathrooms: item.bathrooms ? String(item.bathrooms) : '', parkingSpots: item.parkingSpots ? String(item.parkingSpots) : '', address: item.address || '', neighborhood: item.neighborhood || '', city: item.city || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este imóvel?')) return;
    try { await api(`/realestate/properties/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'title', label: 'Título' },
    { key: 'type', label: 'Tipo' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'price', label: 'Preço', render: (item: any) => item.price ? formatCurrency(Number(item.price)) : '-' },
    { key: 'bedrooms', label: 'Quartos', render: (item: any) => item.bedrooms ?? '-' },
    { key: 'area', label: 'Área m²', render: (item: any) => item.area ? `${item.area} m²` : '-' },
    { key: 'city', label: 'Cidade', render: (item: any) => item.city || '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Imóveis" subtitle="Gerencie os imóveis disponíveis"
        action={<button onClick={() => { setEditItem(null); setForm({ title: '', type: 'apartamento', status: 'disponível', price: '', area: '', bedrooms: '', bathrooms: '', parkingSpots: '', address: '', neighborhood: '', city: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Imóvel</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={properties} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Imóvel' : 'Novo Imóvel'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Título *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                <option value="apartamento">Apartamento</option><option value="casa">Casa</option><option value="cobertura">Cobertura</option><option value="mansão">Mansão</option><option value="terreno">Terreno</option><option value="comercial">Comercial</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="disponível">Disponível</option><option value="reservado">Reservado</option><option value="vendido">Vendido</option><option value="alugado">Alugado</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Área (m²)</label><input type="number" step="0.01" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label><input type="number" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label><input type="number" value={form.bathrooms} onChange={e => setForm({...form, bathrooms: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label><input type="number" value={form.parkingSpots} onChange={e => setForm({...form, parkingSpots: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label><input value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

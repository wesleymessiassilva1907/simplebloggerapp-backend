'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function AestheticClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '', birthDate: '', gender: '',
    skinType: '', photoConsent: false, source: '', notes: '',
  });

  const emptyForm = { name: '', email: '', phone: '', cpf: '', birthDate: '', gender: '', skinType: '', photoConsent: false, source: '', notes: '' };

  const fetchData = async () => {
    try {
      const res = await api('/aesthetic/clients?limit=100');
      setClients(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api(`/aesthetic/clients/${editItem.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/aesthetic/clients', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false); setEditItem(null); setForm(emptyForm); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      name: item.name || '', email: item.email || '', phone: item.phone || '', cpf: item.cpf || '',
      birthDate: item.birthDate?.split('T')[0] || '', gender: item.gender || '', skinType: item.skinType || '',
      photoConsent: item.photoConsent || false, source: item.source || '', notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este cliente?')) return;
    try { await api(`/aesthetic/clients/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'phone', label: 'Telefone' },
    { key: 'skinType', label: 'Tipo de Pele', render: (item: any) => item.skinType || '-' },
    { key: 'source', label: 'Origem', render: (item: any) => item.source || '-' },
    { key: 'photoConsent', label: 'Consentimento Foto', render: (item: any) => item.photoConsent ? 'Sim' : 'Não' },
    { key: 'createdAt', label: 'Cadastro', render: (item: any) => item.createdAt ? formatDate(item.createdAt) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Clientes Estética" subtitle="Gerencie os clientes da clínica estética"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Cliente</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={clients} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="input-field">
                <option value="">Selecione...</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pele</label>
              <select value={form.skinType} onChange={e => setForm({...form, skinType: e.target.value})} className="input-field">
                <option value="">Selecione...</option>
                <option value="normal">Normal</option>
                <option value="seca">Seca</option>
                <option value="oleosa">Oleosa</option>
                <option value="mista">Mista</option>
                <option value="sensível">Sensível</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="input-field">
                <option value="">Selecione...</option>
                <option value="instagram">Instagram</option>
                <option value="indicação">Indicação</option>
                <option value="google">Google</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" checked={form.photoConsent} onChange={e => setForm({...form, photoConsent: e.target.checked})} className="rounded" />
                Consentimento para Fotos
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={3} />
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

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

export default function DentalTreatmentPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    patientId: '', dentistId: '', name: '', description: '',
    status: 'proposto', totalCost: '', discount: '', startDate: '', endDate: '', notes: '',
  });

  const emptyForm = { patientId: '', dentistId: '', name: '', description: '', status: 'proposto', totalCost: '', discount: '', startDate: '', endDate: '', notes: '' };

  const fetchData = async () => {
    try {
      const [planRes, patRes, dentRes] = await Promise.all([
        api('/dental/treatment-plans?limit=100'),
        api('/dental/patients?limit=100'),
        api('/dental/dentists?limit=100'),
      ]);
      setPlans(planRes.data || []);
      setPatients(patRes.data || []);
      setDentists(dentRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        totalCost: form.totalCost ? parseFloat(form.totalCost) : null,
        discount: form.discount ? parseFloat(form.discount) : null,
      };
      if (editItem) {
        await api(`/dental/treatment-plans/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await api('/dental/treatment-plans', { method: 'POST', body: JSON.stringify(data) });
      }
      setShowModal(false); setEditItem(null); setForm(emptyForm); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({
      patientId: item.patientId || '', dentistId: item.dentistId || '',
      name: item.name || '', description: item.description || '',
      status: item.status || 'proposto',
      totalCost: item.totalCost ? String(item.totalCost) : '',
      discount: item.discount ? String(item.discount) : '',
      startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este plano de tratamento?')) return;
    try { await api(`/dental/treatment-plans/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'patient', label: 'Paciente', render: (item: any) => item.patient?.name || '-' },
    { key: 'dentist', label: 'Dentista', render: (item: any) => item.dentist?.name || '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'totalCost', label: 'Custo Total', render: (item: any) => item.totalCost ? formatCurrency(Number(item.totalCost)) : '-' },
    { key: 'discount', label: 'Desconto', render: (item: any) => item.discount ? formatCurrency(Number(item.discount)) : '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Planos de Tratamento" subtitle="Gerencie os planos de tratamento odontológico"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Plano</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={plans} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Plano de Tratamento' : 'Novo Plano de Tratamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
              <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field" required>
                <option value="">Selecione...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dentista *</label>
              <select value={form.dentistId} onChange={e => setForm({...form, dentistId: e.target.value})} className="input-field" required>
                <option value="">Selecione...</option>
                {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Plano *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="proposto">Proposto</option>
                <option value="aprovado">Aprovado</option>
                <option value="em andamento">Em Andamento</option>
                <option value="concluído">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custo Total (R$)</label>
              <input type="number" step="0.01" value={form.totalCost} onChange={e => setForm({...form, totalCost: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (R$)</label>
              <input type="number" step="0.01" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input-field" />
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

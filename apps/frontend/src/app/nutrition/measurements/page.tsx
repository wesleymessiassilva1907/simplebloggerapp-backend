'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ patientId: '', date: '', weight: '', bodyFat: '', muscleMass: '', bmi: '', waist: '', hip: '', arm: '', chest: '', thigh: '', notes: '' });

  const fetchData = async () => {
    try {
      const [measurementsRes, patientsRes] = await Promise.all([
        api('/nutrition/measurements?limit=100'),
        api('/nutrition/patients?limit=100'),
      ]);
      setMeasurements(measurementsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, weight: form.weight ? parseFloat(form.weight) : undefined, bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined, muscleMass: form.muscleMass ? parseFloat(form.muscleMass) : undefined, bmi: form.bmi ? parseFloat(form.bmi) : undefined, waist: form.waist ? parseFloat(form.waist) : undefined, hip: form.hip ? parseFloat(form.hip) : undefined, arm: form.arm ? parseFloat(form.arm) : undefined, chest: form.chest ? parseFloat(form.chest) : undefined, thigh: form.thigh ? parseFloat(form.thigh) : undefined };
      if (editItem) { await api(`/nutrition/measurements/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/nutrition/measurements', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ patientId: item.patientId || '', date: item.date?.split('T')[0] || '', weight: item.weight ? String(item.weight) : '', bodyFat: item.bodyFat ? String(item.bodyFat) : '', muscleMass: item.muscleMass ? String(item.muscleMass) : '', bmi: item.bmi ? String(item.bmi) : '', waist: item.waist ? String(item.waist) : '', hip: item.hip ? String(item.hip) : '', arm: item.arm ? String(item.arm) : '', chest: item.chest ? String(item.chest) : '', thigh: item.thigh ? String(item.thigh) : '', notes: item.notes || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta medição?')) return;
    try { await api(`/nutrition/measurements/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || '-';

  const columns = [
    { key: 'patientId', label: 'Paciente', render: (item: any) => item.patient?.name || getPatientName(item.patientId) },
    { key: 'date', label: 'Data', render: (item: any) => item.date ? formatDate(item.date) : '-' },
    { key: 'weight', label: 'Peso', render: (item: any) => item.weight ? `${item.weight} kg` : '-' },
    { key: 'bodyFat', label: 'Gordura %', render: (item: any) => item.bodyFat ? `${item.bodyFat}%` : '-' },
    { key: 'bmi', label: 'IMC', render: (item: any) => item.bmi ?? '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Medidas Corporais" subtitle="Gerencie as medidas corporais dos pacientes"
        action={<button onClick={() => { setEditItem(null); setForm({ patientId: '', date: '', weight: '', bodyFat: '', muscleMass: '', bmi: '', waist: '', hip: '', arm: '', chest: '', thigh: '', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Medição</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={measurements} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Medição' : 'Nova Medição'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
            <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field" required>
              <option value="">Selecione um paciente</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Data *</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" required /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label><input type="number" step="0.1" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Gordura (%)</label><input type="number" step="0.1" value={form.bodyFat} onChange={e => setForm({...form, bodyFat: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Massa Muscular (kg)</label><input type="number" step="0.1" value={form.muscleMass} onChange={e => setForm({...form, muscleMass: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">IMC</label><input type="number" step="0.01" value={form.bmi} onChange={e => setForm({...form, bmi: e.target.value})} className="input-field" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cintura (cm)</label><input type="number" step="0.1" value={form.waist} onChange={e => setForm({...form, waist: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quadril (cm)</label><input type="number" step="0.1" value={form.hip} onChange={e => setForm({...form, hip: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Braço (cm)</label><input type="number" step="0.1" value={form.arm} onChange={e => setForm({...form, arm: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Peito (cm)</label><input type="number" step="0.1" value={form.chest} onChange={e => setForm({...form, chest: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Coxa (cm)</label><input type="number" step="0.1" value={form.thigh} onChange={e => setForm({...form, thigh: e.target.value})} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Observações</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

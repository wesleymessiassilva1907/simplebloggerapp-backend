'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ patientId: '', doctorId: '', description: '', diagnosis: '', prescription: '' });

  const fetchData = async () => {
    try {
      const [recRes, patRes, docRes] = await Promise.all([
        api('/clinic/medical-records?limit=100'),
        api('/clinic/patients?limit=100'),
        api('/clinic/doctors?limit=100'),
      ]);
      setRecords(recRes.data || []);
      setPatients(patRes.data || []);
      setDoctors(docRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api(`/clinic/medical-records/${editItem.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/clinic/medical-records', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ patientId: item.patientId, doctorId: item.doctorId, description: item.description || '', diagnosis: item.diagnosis || '', prescription: item.prescription || '' });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir este prontuário?')) return;
    try { await api(`/clinic/medical-records/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'createdAt', label: 'Data', render: (item: any) => formatDate(item.createdAt) },
    { key: 'patient', label: 'Paciente', render: (item: any) => item.patient?.name || '-' },
    { key: 'doctor', label: 'Médico', render: (item: any) => item.doctor?.name || '-' },
    { key: 'diagnosis', label: 'Diagnóstico', render: (item: any) => item.diagnosis || '-' },
    { key: 'description', label: 'Descrição', render: (item: any) => item.description?.slice(0, 50) + (item.description?.length > 50 ? '...' : '') },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Prontuários" subtitle="Registros médicos dos pacientes"
        action={<button onClick={() => { setEditItem(null); setForm({ patientId: '', doctorId: '', description: '', diagnosis: '', prescription: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Prontuário</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-[var(--text-muted)]">Carregando...</p> : <DataTable columns={columns} data={records} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Prontuário' : 'Novo Prontuário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Paciente *</label>
            <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field" required>
              <option value="">Selecione...</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Médico *</label>
            <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="input-field" required>
              <option value="">Selecione...</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Descrição *</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={3} required /></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Diagnóstico</label><input value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Prescrição</label><textarea value={form.prescription} onChange={e => setForm({...form, prescription: e.target.value})} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

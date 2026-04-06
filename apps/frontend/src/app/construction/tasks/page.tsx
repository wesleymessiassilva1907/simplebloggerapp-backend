'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ projectId: '', name: '', description: '', startDate: '', endDate: '', status: 'pending', progressPercent: '0' });

  const fetchData = async () => {
    try {
      const [taskRes, projRes] = await Promise.all([api('/construction/tasks?limit=100'), api('/construction/projects?limit=100')]);
      setTasks(taskRes.data || []); setProjects(projRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, progressPercent: parseInt(form.progressPercent) };
      if (editItem) { await api(`/construction/tasks/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      else { await api('/construction/tasks', { method: 'POST', body: JSON.stringify(data) }); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ projectId: item.projectId, name: item.name, description: item.description || '', startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '', status: item.status, progressPercent: String(item.progressPercent) });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Deseja excluir esta tarefa?')) return;
    try { await api(`/construction/tasks/${item.id}`, { method: 'DELETE' }); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Tarefa' },
    { key: 'project', label: 'Projeto', render: (item: any) => item.project?.name || '-' },
    { key: 'status', label: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'progressPercent', label: 'Progresso', render: (item: any) => (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-200 rounded-full h-2"><div className="bg-primary-500 h-2 rounded-full" style={{ width: `${item.progressPercent}%` }} /></div>
        <span className="text-xs text-gray-500">{item.progressPercent}%</span>
      </div>
    )},
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Tarefas" subtitle="Gerencie as tarefas dos projetos"
        action={<button onClick={() => { setEditItem(null); setForm({ projectId: '', name: '', description: '', startDate: '', endDate: '', status: 'pending', progressPercent: '0' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Tarefa</button>} />
      <div className="card">
        {loading ? <p className="text-center py-8 text-gray-400">Carregando...</p> : <DataTable columns={columns} data={tasks} onEdit={handleEdit} onDelete={handleDelete} />}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Editar Tarefa' : 'Nova Tarefa'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Projeto *</label>
            <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} className="input-field" required>
              <option value="">Selecione...</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="pending">Pendente</option><option value="in_progress">Em Andamento</option><option value="completed">Concluído</option><option value="blocked">Bloqueado</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Progresso (%)</label><input type="number" min="0" max="100" value={form.progressPercent} onChange={e => setForm({...form, progressPercent: e.target.value})} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Salvar' : 'Cadastrar'}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

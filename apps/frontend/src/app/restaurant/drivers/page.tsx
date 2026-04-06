'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Bike, Plus, Pencil, Trash2 } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  isAvailable: boolean;
  status: string;
}

const initialForm = {
  name: '',
  phone: '',
  vehicle: 'moto',
  licensePlate: '',
  isAvailable: true,
  status: 'online',
};

export default function RestaurantDriversPage() {
  const [data, setData] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Driver | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get('/restaurant/drivers');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/restaurant/drivers/${editItem.id}`, form);
      } else {
        await api.post('/restaurant/drivers', form);
      }
      setShowModal(false);
      setEditItem(null);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar entregador:', error);
    }
  }

  function handleEdit(item: Driver) {
    setEditItem(item);
    setForm({
      name: item.name,
      phone: item.phone,
      vehicle: item.vehicle,
      licensePlate: item.licensePlate,
      isAvailable: item.isAvailable,
      status: item.status,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este entregador?')) return;
    try {
      await api.delete(`/restaurant/drivers/${id}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir entregador:', error);
    }
  }

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof Driver },
    { header: 'Telefone', accessor: 'phone' as keyof Driver },
    {
      header: 'Veículo',
      accessor: 'vehicle' as keyof Driver,
      cell: (item: Driver) => {
        const vehicles: Record<string, string> = {
          moto: 'Moto',
          carro: 'Carro',
          bicicleta: 'Bicicleta',
        };
        return vehicles[item.vehicle] || item.vehicle;
      },
    },
    { header: 'Placa', accessor: 'licensePlate' as keyof Driver },
    {
      header: 'Disponível',
      accessor: 'isAvailable' as keyof Driver,
      cell: (item: Driver) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.isAvailable ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Driver,
      cell: (item: Driver) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Ações',
      accessor: 'id' as keyof Driver,
      cell: (item: Driver) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(item)} className="text-brand-500 hover:text-brand-700">
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Entregadores"
        icon={<Bike />}
        action={
          <button
            onClick={() => {
              setEditItem(null);
              setForm(initialForm);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Novo Entregador
          </button>
        }
      />

      <DataTable columns={columns} data={data} loading={loading} />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditItem(null);
          setForm(initialForm);
        }}
        title={editItem ? 'Editar Entregador' : 'Novo Entregador'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Veículo</label>
            <select
              value={form.vehicle}
              onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="moto">Moto</option>
              <option value="carro">Carro</option>
              <option value="bicicleta">Bicicleta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Placa</label>
            <input
              type="text"
              value={form.licensePlate}
              onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium">
              Disponível
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="entregando">Entregando</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditItem(null);
                setForm(initialForm);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-[var(--bg-primary)]"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editItem ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

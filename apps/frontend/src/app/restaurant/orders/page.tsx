'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag, Plus, Pencil, Trash2 } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  channel: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes: string;
  createdAt: string;
}

const initialForm = {
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  channel: 'delivery',
  status: 'pendente',
  subtotal: '',
  deliveryFee: '',
  discount: '',
  total: '',
  paymentMethod: 'PIX',
  notes: '',
};

export default function RestaurantOrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Order | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get('/restaurant/orders');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        subtotal: parseFloat(form.subtotal) || 0,
        deliveryFee: parseFloat(form.deliveryFee) || 0,
        discount: parseFloat(form.discount) || 0,
        total: parseFloat(form.total) || 0,
      };
      if (editItem) {
        await api.put(`/restaurant/orders/${editItem.id}`, payload);
      } else {
        await api.post('/restaurant/orders', payload);
      }
      setShowModal(false);
      setEditItem(null);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
    }
  }

  function handleEdit(item: Order) {
    setEditItem(item);
    setForm({
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      customerAddress: item.customerAddress,
      channel: item.channel,
      status: item.status,
      subtotal: String(item.subtotal),
      deliveryFee: String(item.deliveryFee),
      discount: String(item.discount),
      total: String(item.total),
      paymentMethod: item.paymentMethod,
      notes: item.notes,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      await api.delete(`/restaurant/orders/${id}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
    }
  }

  const columns = [
    { header: 'Número', accessor: 'orderNumber' as keyof Order },
    { header: 'Cliente', accessor: 'customerName' as keyof Order },
    {
      header: 'Canal',
      accessor: 'channel' as keyof Order,
      cell: (item: Order) => {
        const channels: Record<string, string> = {
          delivery: 'Delivery',
          retirada: 'Retirada',
          salao: 'Salão',
          ifood: 'iFood',
          rappi: 'Rappi',
          ubereats: 'UberEats',
        };
        return channels[item.channel] || item.channel;
      },
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Order,
      cell: (item: Order) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Total',
      accessor: 'total' as keyof Order,
      cell: (item: Order) => formatCurrency(item.total),
    },
    { header: 'Pagamento', accessor: 'paymentMethod' as keyof Order },
    {
      header: 'Criado em',
      accessor: 'createdAt' as keyof Order,
      cell: (item: Order) => formatDate(item.createdAt),
    },
    {
      header: 'Ações',
      accessor: 'id' as keyof Order,
      cell: (item: Order) => (
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
        title="Pedidos"
        icon={<ShoppingBag />}
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
            Novo Pedido
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
        title={editItem ? 'Editar Pedido' : 'Novo Pedido'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Cliente</label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input
              type="text"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endereço</label>
            <input
              type="text"
              value={form.customerAddress}
              onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Canal</label>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="delivery">Delivery</option>
              <option value="retirada">Retirada</option>
              <option value="salao">Salão</option>
              <option value="ifood">iFood</option>
              <option value="rappi">Rappi</option>
              <option value="ubereats">UberEats</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="preparando">Preparando</option>
              <option value="pronto">Pronto</option>
              <option value="entregando">Entregando</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtotal</label>
            <input
              type="number"
              step="0.01"
              value={form.subtotal}
              onChange={(e) => setForm({ ...form, subtotal: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Taxa de Entrega</label>
            <input
              type="number"
              step="0.01"
              value={form.deliveryFee}
              onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Desconto</label>
            <input
              type="number"
              step="0.01"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total</label>
            <input
              type="number"
              step="0.01"
              value={form.total}
              onChange={(e) => setForm({ ...form, total: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="PIX">PIX</option>
              <option value="cartao_credito">Cartão Crédito</option>
              <option value="cartao_debito">Cartão Débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
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

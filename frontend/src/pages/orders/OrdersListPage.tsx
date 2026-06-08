import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';
import { useDebounce } from '../../hooks/useDebounce';
import './OrdersListPage.css';

export const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const debouncedSearch = useDebounce(search, 500);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orderService.getAll({ 
        page, 
        limit, 
        search: debouncedSearch,
        status: status || undefined
      });
      setOrders(result.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, debouncedSearch, status]);

  const columns = [
    { header: 'Nº Pedido', accessor: 'orderNumber' as keyof Order },
    { 
      header: 'Cliente', 
      accessor: 'clientId',
      render: (_val: any, row: Order) => row.client?.name || 'Consumidor Final'
    },
    { header: 'Producto', accessor: 'productDescription' as keyof Order },
    { 
      header: 'Total', 
      accessor: 'total' as keyof Order,
      render: (val: any) => `$${Number(val).toLocaleString()}`
    },
    { 
      header: 'Estado', 
      accessor: 'status' as keyof Order,
      render: (val: any) => <StatusBadge status={val} />
    },
    { 
      header: 'Fecha Ingreso', 
      accessor: 'createdAt' as keyof Order,
      render: (val: any) => new Date(val).toLocaleDateString()
    },
  ];

  return (
    <div className="orders-page">
      <div className="orders-page__header">
        <h1 className="orders-page__title">Pedidos</h1>
      </div>

      <div className="orders-page__filters">
        <div style={{ flex: 1 }}>
          <Input 
            placeholder="Buscar por Nº, cliente o producto..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="input-group" style={{ minWidth: '200px' }}>
          <select 
            className="input__field"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus | '');
              setPage(1);
            }}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="RECIBIDO">Recibido</option>
            <option value="ESPERANDO_DISENO">Esperando Diseño</option>
            <option value="ESPERANDO_CONFIRMACION">Esperando Confirmación</option>
            <option value="EN_PRODUCCION">En Producción</option>
            <option value="TERMINADO">Terminado</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={orders} 
        loading={loading}
        emptyMessage="No se encontraron pedidos"
        onRowClick={(order) => navigate(`/pedidos/${order.id}`)}
      />
    </div>
  );
};

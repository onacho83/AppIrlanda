import React, { useEffect, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import type { Payment } from '../../types';
import { paymentService } from '../../services/paymentService';
import './PaymentsPage.css';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const result = await paymentService.getPayments({ page: 1, limit: 20 });
      setPayments(result.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns = [
    { 
      header: 'Fecha', 
      accessor: 'createdAt' as keyof Payment,
      render: (val: any) => new Date(val).toLocaleString()
    },
    {
      header: 'Cliente',
      accessor: 'clientId',
      render: (_val: any, row: Payment) => row.client?.name || 'Desconocido',
    },
    {
      header: 'Monto',
      accessor: 'amount',
      render: (_val: any, row: Payment) => `$${row.amount.toLocaleString()}`,
    },
    { 
      header: 'Método', 
      accessor: 'method' as keyof Payment 
    },
    { 
      header: 'Referencia', 
      accessor: 'reference' as keyof Payment,
      render: (val: any) => val || '-'
    },
  ];

  return (
    <div className="payments-page">
      <div className="payments-page__header">
        <h1 className="payments-page__title">Pagos Recibidos</h1>
      </div>

      <DataTable 
        columns={columns} 
        data={payments} 
        loading={loading}
        emptyMessage="No hay pagos registrados"
      />
    </div>
  );
};

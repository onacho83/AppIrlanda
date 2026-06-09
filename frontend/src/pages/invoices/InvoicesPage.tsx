import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Spinner } from '../../components/ui/Spinner';
import { invoiceService } from '../../services/invoiceService';
import type { Invoice } from '../../types';
import './InvoicesPage.css';
import { DownloadInvoicePdfButton } from './DownloadInvoicePdfButton';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoices();
      setInvoices(res.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const columns = [
    { header: 'Comprobante', accessor: 'invoiceNumber' as keyof Invoice },
    { 
      header: 'Fecha', 
      accessor: 'createdAt' as keyof Invoice,
      render: (val: any) => new Date(val).toLocaleDateString()
    },
    { header: 'Tipo', accessor: 'invoiceType' as keyof Invoice },
    { 
      header: 'Neto', 
      accessor: 'netAmount' as keyof Invoice,
      render: (val: any) => `$${Number(val).toLocaleString()}`
    },
    { 
      header: 'IVA', 
      accessor: 'taxAmount' as keyof Invoice,
      render: (val: any) => `$${Number(val).toLocaleString()}`
    },
    { 
      header: 'Total', 
      accessor: 'total' as keyof Invoice,
      render: (val: any) => `$${Number(val).toLocaleString()}`
    },
    { 
      header: 'CAE', 
      accessor: 'cae' as keyof Invoice,
      render: (val: any) => val || '-'
    },
    {
      header: 'Acciones',
      accessor: 'id' as keyof Invoice,
      render: (_: any, invoice: Invoice) => (
        <DownloadInvoicePdfButton invoice={invoice} />
      )
    }
  ];

  if (loading) {
    return (
      <div className="invoices-page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="invoices-page">
      <div className="invoices-page__header">
        <h1 className="invoices-page__title">Facturación AFIP</h1>
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={invoices}
          emptyMessage="No hay facturas emitidas"
        />
      </Card>
    </div>
  );
};

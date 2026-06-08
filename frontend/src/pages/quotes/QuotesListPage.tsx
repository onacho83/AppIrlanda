import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import type { Quote } from '../../types';
import { quoteService } from '../../services/quoteService';
import './QuotesListPage.css';

export const QuotesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const result = await quoteService.getQuotes({ page: 1, limit: 100 });
      setQuotes(result.data);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const columns = [
    { header: 'Nº Presupuesto', accessor: 'quoteNumber' as keyof Quote },
    { 
      header: 'Fecha', 
      accessor: 'createdAt' as keyof Quote,
      render: (val: any) => new Date(val).toLocaleDateString()
    },
    { 
      header: 'Cliente', 
      accessor: 'clientId',
      render: (_val: any, row: Quote) => row.client?.name || 'Consumidor Final'
    },
    { 
      header: 'Total', 
      accessor: 'total' as keyof Quote,
      render: (val: any) => `$${Number(val).toLocaleString()}`
    },
    { 
      header: 'Estado', 
      accessor: 'status' as keyof Quote,
      render: (val: any) => {
        let color = 'var(--color-text-secondary)';
        let bg = 'var(--color-surface)';
        if (val === 'ACEPTADO') { color = 'var(--color-success)'; bg = 'rgba(16, 185, 129, 0.1)'; }
        if (val === 'RECHAZADO' || val === 'VENCIDO') { color = 'var(--color-danger)'; bg = 'rgba(239, 68, 68, 0.1)'; }
        if (val === 'PENDIENTE') { color = 'var(--color-warning-dark)'; bg = 'rgba(245, 158, 11, 0.1)'; }
        
        return (
          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color, backgroundColor: bg }}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Acciones',
      accessor: 'id' as keyof Quote,
      render: (val: any) => (
        <Button variant="ghost" onClick={() => navigate(`/presupuestos/${val}`)}>
          Ver Detalle
        </Button>
      )
    }
  ];

  return (
    <div className="quotes-page">
      <div className="quotes-page__header">
        <h1 className="quotes-page__title">Presupuestos</h1>
        <div className="quotes-page__actions">
          <Button variant="primary" onClick={() => navigate('/presupuestos/nuevo')}>
            Nuevo Presupuesto
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={quotes} 
        loading={loading}
        emptyMessage="No se encontraron presupuestos"
      />
    </div>
  );
};

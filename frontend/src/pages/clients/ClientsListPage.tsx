import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import type { Client } from '../../types';
import { clientService } from '../../services/clientService';
import { useDebounce } from '../../hooks/useDebounce';
import { ClientFormModal } from './ClientFormModal';
import './ClientsListPage.css';

export const ClientsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const result = await clientService.getAll({ page, limit, search: debouncedSearch });
      setClients(result.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, debouncedSearch]);

  const columns = [
    { header: 'Nombre / Razón Social', accessor: 'name' as keyof Client },
    { header: 'CUIT', accessor: 'cuit' as keyof Client },
    { header: 'Email', accessor: 'email' as keyof Client },
    { header: 'Teléfono', accessor: 'phone' as keyof Client },
    { 
      header: 'Cta. Cte.', 
      accessor: 'hasCurrentAccount' as keyof Client,
      render: (val: any) => (val ? 'Sí' : 'No') 
    },
  ];

  return (
    <div className="clients-page">
      <div className="clients-page__header">
        <h1 className="clients-page__title">Clientes</h1>
        <div className="clients-page__actions">
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <div className="clients-page__filters">
        <div className="clients-page__search">
          <Input 
            placeholder="Buscar por nombre, email o teléfono..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={clients} 
        loading={loading}
        emptyMessage="No se encontraron clientes"
        rowKey={(client) => client.id}
        onRowClick={(client) => navigate(`/clientes/${client.id}`)}
      />

      <ClientFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClients}
      />
    </div>
  );
};

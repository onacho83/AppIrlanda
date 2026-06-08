import React, { useState, useMemo } from 'react';
import { EmptyState } from './EmptyState';
import './DataTable.css';

/** Definición de columna para la tabla */
export interface DataTableColumn<T> {
  /** Texto del encabezado */
  header: string;
  /** Clave del objeto para obtener el valor */
  accessor: keyof T | string;
  /** Si la columna es ordenable */
  sortable?: boolean;
  /** Render personalizado de la celda */
  render?: (val: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  /** Definición de columnas */
  columns: DataTableColumn<T>[];
  /** Datos a mostrar */
  data: T[];
  /** Estado de carga (muestra skeleton) */
  loading?: boolean;
  /** Mensaje cuando no hay datos */
  emptyMessage?: string;
  /** Ícono del estado vacío */
  emptyIcon?: string;
  /** Callback al hacer click en una fila */
  onRowClick?: (row: T) => void;
  /** Función para obtener la key única de cada fila */
  rowKey?: (row: T) => string;
}

/** Tabla de datos genérica con ordenamiento, skeleton loader y estado vacío */
export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos',
  emptyIcon = '📋',
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  /** Alternar ordenamiento al hacer click en header */
  const handleSort = (accessor: string) => {
    if (sortColumn === accessor) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(accessor);
      setSortDirection('asc');
    }
  };

  /** Datos ordenados */
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortColumn];
      const bVal = (b as Record<string, unknown>)[sortColumn];
      if (aVal == null || bVal == null) return 0;
      const cmp = String(aVal).localeCompare(String(bVal), 'es', {
        numeric: true,
      });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [data, sortColumn, sortDirection]);

  /* Estado de carga: skeleton */
  if (loading) {
    return (
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="data-table__th">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="data-table__row">
                {columns.map((_, j) => (
                  <td key={j} className="data-table__td">
                    <div
                      className="skeleton"
                      style={{
                        height: '16px',
                        width: `${60 + (((i + j) * 17) % 30)}%`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* Estado vacío */
  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyMessage} />;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table" role="table">
        <thead>
          <tr>
            {columns.map((col, i) => {
              const accessorStr = String(col.accessor);
              const isActive = sortColumn === accessorStr;
              return (
                <th
                  key={i}
                  className={[
                    'data-table__th',
                    col.sortable && 'data-table__th--sortable',
                    isActive && 'data-table__th--active',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={
                    col.sortable ? () => handleSort(accessorStr) : undefined
                  }
                  aria-sort={
                    isActive
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <span className="data-table__th-content">
                    {col.header}
                    {col.sortable && (
                      <span
                        className="data-table__sort-icon"
                        aria-hidden="true"
                      >
                        {isActive
                          ? sortDirection === 'asc'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row) : i}
              className={[
                'data-table__row',
                onRowClick && 'data-table__row--clickable',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col, j) => (
                <td key={j} className="data-table__td">
                  {col.render
                    ? col.render((row as Record<string, unknown>)[String(col.accessor)], row)
                    : String(
                        (row as Record<string, unknown>)[
                          String(col.accessor)
                        ] ?? ''
                      )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';
import { ColumnFormat } from '@/types/fieldTypes';
import { formatColumns } from '@/utils/columnTransformers';
import { formatDateForInput, isDateField } from '@/utils/dateFormatter';
import { useUser } from '@/hooks/useUser';
import { notFound } from 'next/navigation';

// Valid table types
const VALID_TABLES = ['leads', 'tasks', 'finances', 'customers'] as const;
type TableType = typeof VALID_TABLES[number];

// Search fields configuration by table type
const SEARCH_FIELDS: Record<TableType, string[]> = {
  tasks: ['title', 'description', 'status', 'priority'],
  leads: ['name', 'email', 'phone', 'status'],
  finances: ['description', 'type', 'tag'],
  customers: ['name', 'email', 'phone', 'status'],
};

export default function TablePage({ params }: { params: { table: string } }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState<ColumnFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const table = params.table as TableType;

  // Validate table parameter
  if (!VALID_TABLES.includes(table)) {
    notFound();
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      const [columnsResponse, dataResponse] = await Promise.all([
        fetch(`/api/${table}/columns`),
        fetch(`/api/${table}`)
      ]);

      if (!columnsResponse.ok) throw new Error('Failed to fetch columns');
      if (!dataResponse.ok) throw new Error('Failed to fetch data');

      const columnsData = await columnsResponse.json();
      const tableData = await dataResponse.json();

      // Format dates without modifying the order
      const formattedData = tableData.map((item: any) => {
        const formattedItem = { ...item };
        columnsData.forEach((col: { data_type: string; column_name: string | number; }) => {
          if (
            (col.data_type === 'timestamp' || col.data_type === 'date') && 
            formattedItem[col.column_name]
          ) {
            formattedItem[col.column_name] = formatDateForInput(formattedItem[col.column_name]);
          }
        });
        return formattedItem;
      });

      const formattedColumns = await formatColumns(columnsData, table);
      setColumns(formattedColumns);
      setData(formattedData);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table]);

  if (loading) return <Layout>Loading...</Layout>;
  if (error) return <Layout>Error: {error}</Layout>;

  return (
    <Layout>
      <DataTable
        columns={columns}
        data={data}
        type={table}
        onRefresh={fetchData}
        searchableFields={SEARCH_FIELDS[table]}
        user={table === 'leads' ? user : undefined}
      />
    </Layout>
  );
}
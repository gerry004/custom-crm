'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';
import { ColumnFormat } from '@/types/fieldTypes';
import { formatColumns } from '@/utils/columnTransformers';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [columns, setColumns] = useState<ColumnFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [columnsResponse, customersResponse] = await Promise.all([
        fetch('/api/customers/columns'),
        fetch('/api/customers')
      ]);

      if (!columnsResponse.ok) throw new Error('Failed to fetch columns');
      if (!customersResponse.ok) throw new Error('Failed to fetch customers');

      const columnsData = await columnsResponse.json();
      const customersData = await customersResponse.json();
      
      const formattedColumns = formatColumns(columnsData);

      setColumns(formattedColumns);
      setCustomers(customersData);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Layout>Loading...</Layout>;
  if (error) return <Layout>Error: {error}</Layout>;

  return (
    <Layout>
      <div>
        <DataTable
          columns={columns}
          data={customers}
          type="customers"
          onRefresh={fetchData}
        />
      </div>
    </Layout>
  );
} 
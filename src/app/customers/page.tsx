'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [columns, setColumns] = useState([]);
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

      console.log('Fetched customers:', customersData);

      const formattedColumns = columnsData.map((column: string) => ({
        key: column
          .toLowerCase()
          .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase()),
        label: column
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      }));

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
      <div onClick={() => console.log('Layout clicked')}>
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
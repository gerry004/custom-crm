'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both columns and data
        const [columnsResponse, customersResponse] = await Promise.all([
          fetch('/api/customers/columns'),
          fetch('/api/customers')
        ]);

        if (!columnsResponse.ok) throw new Error('Failed to fetch columns');
        if (!customersResponse.ok) throw new Error('Failed to fetch customers');

        const columnsData = await columnsResponse.json();
        const customersData = await customersResponse.json();

        // Transform column data into required format
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

    fetchData();
  }, []);

  if (loading) {
    return <Layout>Loading...</Layout>;
  }
  
  if (error) {
    return <Layout>Error: {error}</Layout>;
  }

  return (
    <Layout>
      <DataTable
        columns={columns}
        data={customers}
        type="customers"
      />
    </Layout>
  );
} 
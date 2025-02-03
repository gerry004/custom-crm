'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';
import { formatColumns, type ColumnFormat } from '@/utils/columnTransformers';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [columns, setColumns] = useState<ColumnFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [columnsResponse, leadsResponse] = await Promise.all([
        fetch('/api/leads/columns'),
        fetch('/api/leads')
      ]);

      if (!columnsResponse.ok) throw new Error('Failed to fetch columns');
      if (!leadsResponse.ok) throw new Error('Failed to fetch leads');

      const columnsData = await columnsResponse.json();
      const leadsData = await leadsResponse.json();

      setColumns(formatColumns(columnsData));
      setLeads(leadsData);
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
      <DataTable
        columns={columns}
        data={leads}
        type="leads"
        onRefresh={fetchData}
      />
    </Layout>
  );
} 
'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';
import { formatColumns, type ColumnFormat } from '@/utils/columnTransformers';
import { formatDateForInput, isDateField } from '@/utils/dateFormatter';

export default function FinancesPage() {
  const [finances, setFinances] = useState([]);
  const [columns, setColumns] = useState<ColumnFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [columnsResponse, financesResponse] = await Promise.all([
        fetch('/api/finances/columns'),
        fetch('/api/finances')
      ]);

      if (!columnsResponse.ok) throw new Error('Failed to fetch columns');
      if (!financesResponse.ok) throw new Error('Failed to fetch finances');

      const columnsData = await columnsResponse.json();
      const financesData = await financesResponse.json();

      const formattedFinances = financesData.map((finance: any) => {
        const formattedFinance = { ...finance };
        Object.keys(formattedFinance).forEach(key => {
          if (isDateField(key) && formattedFinance[key]) {
            formattedFinance[key] = formatDateForInput(formattedFinance[key]);
          }
        });
        return formattedFinance;
      });

      setColumns(formatColumns(columnsData));
      setFinances(formattedFinances);
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
        data={finances}
        type="finances"
        onRefresh={fetchData}
        searchableFields={['description', 'type', 'tag']}
      />
    </Layout>
  );
} 
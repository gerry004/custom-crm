'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';
import { ColumnFormat } from '@/types/fieldTypes';
import { formatColumns } from '@/utils/columnTransformers';
import { formatDateForInput, isDateField } from '@/utils/dateFormatter';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState<ColumnFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [columnsResponse, tasksResponse] = await Promise.all([
        fetch('/api/tasks/columns'),
        fetch('/api/tasks')
      ]);

      if (!columnsResponse.ok) throw new Error('Failed to fetch columns');
      if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');

      const columnsData = await columnsResponse.json();
      const tasksData = await tasksResponse.json();

      const formattedTasks = tasksData.map((task: any) => {
        const formattedTask = { ...task };
        Object.keys(formattedTask).forEach(key => {
          if (isDateField(key) && formattedTask[key]) {
            formattedTask[key] = formatDateForInput(formattedTask[key]);
          }
        });
        return formattedTask;
      });

      setColumns(formatColumns(columnsData));
      setTasks(formattedTasks);
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
        data={tasks}
        type="tasks"
        onRefresh={fetchData}
        searchableFields={['title', 'description', 'status', 'priority']}
      />
    </Layout>
  );
} 
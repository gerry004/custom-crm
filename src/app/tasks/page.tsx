'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
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
      setTasks(tasksData);
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
      />
    </Layout>
  );
} 
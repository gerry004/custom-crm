'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [columnsResponse, teamMembersResponse] = await Promise.all([
        fetch('/api/team-members/columns'),
        fetch('/api/team-members')
      ]);

      if (!columnsResponse.ok) throw new Error('Failed to fetch columns');
      if (!teamMembersResponse.ok) throw new Error('Failed to fetch team members');

      const columnsData = await columnsResponse.json();
      const teamMembersData = await teamMembersResponse.json();

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
      setTeamMembers(teamMembersData);
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
        data={teamMembers}
        type="team-members"
        onRefresh={fetchData}
      />
    </Layout>
  );
} 
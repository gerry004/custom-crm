'use client';

import React from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';

const leadsData = [
  {
    name: 'Jane Smith',
    company: 'Tech Corp',
    email: 'jane@techcorp.com',
    source: 'Website',
    status: 'New',
  },
  // Add more sample data as needed
];

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email' },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'Status' },
];

export default function LeadsPage() {
  return (
    <Layout>
      <DataTable
        columns={columns}
        data={leadsData}
        type="leads"
      />
    </Layout>
  );
} 
'use client';

import React from 'react';
import DataTable from '../../components/DataTable';
import Layout from '../../components/Layout';

const customersData = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    status: 'Active',
    lastContact: '2024-01-20',
  },
  // Add more sample data as needed
];

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'lastContact', label: 'Last Contact' },
];

export default function CustomersPage() {
  return (
    <Layout>
      <DataTable
        columns={columns}
        data={customersData}
        type="customers"
      />
    </Layout>
  );
} 
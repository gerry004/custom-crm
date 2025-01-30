'use client';

import React from 'react';
import { FiSearch, FiTrash2, FiMove } from 'react-icons/fi';
import CreateEntryModal from './CreateEntryModal';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  type: 'customers' | 'leads';
  onRefresh?: () => void;
}

const DataTable = ({ columns, data, type, onRefresh }: DataTableProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      onRefresh?.();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatCellValue = (value: any, key: string) => {
    if (value === null || value === undefined) return '';
    
    if (['lastContact', 'createdAt', 'updatedAt'].includes(key) && value) {
      return formatDate(value);
    }
    return value;
  };

  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    const name = String(row.name || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold capitalize">{type}</h2>
          <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
            {filteredData.length}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => setIsModalOpen(true)}
          >
            New {type.slice(0, -1)}
          </button>
        </div>
      </div>

      <div className="bg-[#191919] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#2f2f2f] text-gray-300">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-sm font-medium"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr
                  key={index}
                  className="text-gray-300 hover:bg-[#2f2f2f]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm whitespace-nowrap"
                    >
                      {formatCellValue(row[column.key], column.key)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={isDeleting === row.id}
                      className={`text-gray-400 hover:text-red-500 transition-colors ${
                        isDeleting === row.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + 1} 
                  className="px-6 py-8 text-center text-gray-400"
                >
                  {data.length === 0 ? (
                    <div>
                      <p className="text-lg mb-2">No {type} found</p>
                      <p className="text-sm">
                        Click the "New {type.slice(0, -1)}" button to add one
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg mb-2">No matching {type} found</p>
                      <p className="text-sm">
                        Try adjusting your search query
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        columns={columns}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default DataTable; 
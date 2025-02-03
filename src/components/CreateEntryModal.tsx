import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import StatusDropdown from './StatusDropdown';
import { isDateField, formatDateForInput } from '@/utils/dateFormatter';

interface CreateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'customers' | 'leads' | 'tasks' | 'team-members';
  columns: Column[];
  onSuccess?: () => void;
}

interface Column {
  key: string;
  label: string;
}

const STATUS_COLORS = {
  'To Do': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  'In Progress': 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  'Done': 'bg-green-500/20 text-green-500 border-green-500/50',
} as const;

const TASK_STATUSES = ['To Do', 'In Progress', 'Done'] as const;

const PRIORITY_COLORS = {
  'Low': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  'Medium': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  'High': 'bg-red-500/20 text-red-500 border-red-500/50',
} as const;

const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;

const CUSTOMER_STATUS_COLORS = {
  'Active': 'bg-green-500/20 text-green-500 border-green-500/50',
  'Inactive': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  'Pending': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
} as const;

const CUSTOMER_STATUSES = ['Active', 'Inactive', 'Pending'] as const;

const LEAD_STATUS_COLORS = {
  'New': 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  'Contacted': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  'Qualified': 'bg-green-500/20 text-green-500 border-green-500/50',
  'Lost': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
} as const;

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'] as const;

const CreateEntryModal = ({ isOpen, onClose, type, columns, onSuccess }: CreateEntryModalProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  // Filter out timestamp columns from the form
  const formColumns = columns.filter(column => {
    const key = column.key.toLowerCase();
    return !key.includes('createdat') && 
           !key.includes('updatedat') && 
           !key.includes('created_at') && 
           !key.includes('updated_at');
  });

  const renderInput = (column: Column) => {
    const value = formData[column.key] || '';

    if (column.key === 'status') {
      return (
        <StatusDropdown
          type={
            type === 'tasks'
              ? 'task-status'
              : type === 'customers'
              ? 'customer-status'
              : 'lead-status'
          }
          value={value}
          onChange={(value) => handleInputChange(column.key, value)}
        />
      );
    }

    if (column.key === 'priority' && type === 'tasks') {
      return (
        <StatusDropdown
          type="task-priority"
          value={value}
          onChange={(value) => handleInputChange(column.key, value)}
        />
      );
    }

    if (isDateField(column.key)) {
      return (
        <input
          type="date"
          id={column.key}
          name={column.key}
          value={formatDateForInput(value)}
          onChange={(e) => {
            handleInputChange(column.key, e.target.value);
          }}
          className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
        />
      );
    }

    return (
      <input
        type="text"
        id={column.key}
        name={column.key}
        value={value}
        onChange={(e) => handleInputChange(column.key, e.target.value)}
        className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
      />
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const processedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (isDateField(key) && value) {
          // Ensure dates are in ISO format
          const date = new Date(value);
          acc[key] = date.toISOString();
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const response = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create entry');
      }

      onSuccess?.();
      onClose();
      setFormData({});
    } catch (err) {
      console.error('Error creating entry:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#191919] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white capitalize">
            New {type.slice(0, -1)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {formColumns.map((column) => {
              return (
                <div key={column.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {column.label}
                  </label>
                  {renderInput(column)}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEntryModal; 
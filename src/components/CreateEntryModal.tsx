import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

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

const CreateEntryModal = ({ isOpen, onClose, type, columns, onSuccess }: CreateEntryModalProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter out timestamp columns from the form
  const formColumns = columns.filter(column => {
    const key = column.key.toLowerCase();
    return !key.includes('createdat') && 
           !key.includes('updatedat') && 
           !key.includes('created_at') && 
           !key.includes('updated_at');
  });

  const getInputType = (key: string): string => {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('email')) return 'email';
    if (keyLower.includes('phone')) return 'tel';
    if (keyLower === 'lastcontact' || keyLower.includes('date')) return 'date';
    if (keyLower === 'status' && (type === 'tasks' || type === 'customers')) return 'select';
    if (keyLower === 'priority' && type === 'tasks') return 'select';
    return 'text';
  };

  const formatDateForInput = (value: string): string => {
    if (!value) return '';
    try {
      const date = new Date(value);
      // Format: YYYY-MM-DD
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const handleInputChange = (key: string, value: string) => {
    const keyLower = key.toLowerCase();
    if (keyLower === 'lastcontact' || keyLower.includes('date')) {
      // Set the time to midnight UTC to store only the date
      const dateValue = value ? new Date(value + 'T00:00:00.000Z').toISOString() : '';
      setFormData(prev => ({
        ...prev,
        [key]: dateValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Add current date (without time) for createdAt and updatedAt
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      const nowISOString = now.toISOString();
      
      const dataToSubmit = {
        ...formData,
        createdAt: nowISOString,
        updatedAt: nowISOString
      };

      const response = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create entry');
      }

      await response.json();
      onSuccess?.();
      onClose();
      setFormData({});
    } catch (err) {
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
              const inputType = getInputType(column.key);
              const value = inputType === 'datetime-local' 
                ? formatDateForInput(formData[column.key] || '')
                : formData[column.key] || '';

              return (
                <div key={column.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {column.label}
                  </label>
                  {inputType === 'select' ? (
                    <select
                      value={value}
                      onChange={(e) => handleInputChange(column.key, e.target.value)}
                      className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
                    >
                      <option value="">Select {column.label}</option>
                      {type === 'tasks' ? (
                        column.key === 'status' ? (
                          TASK_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))
                        ) : (
                          TASK_PRIORITIES.map((priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          ))
                        )
                      ) : (
                        CUSTOMER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))
                      )}
                    </select>
                  ) : (
                    <input
                      type={inputType}
                      value={value}
                      onChange={(e) => handleInputChange(column.key, e.target.value)}
                      className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
                    />
                  )}
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
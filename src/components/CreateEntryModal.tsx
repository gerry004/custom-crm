import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import StatusDropdown from './StatusDropdown';
import { isDateField, formatDateForInput } from '@/utils/dateFormatter';
import { ColumnFormat } from '@/types/fieldTypes';

interface CreateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'customers' | 'leads' | 'tasks' | 'finances';
  columns: ColumnFormat[];
  onSuccess?: () => void;
}

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

  const renderInput = (column: ColumnFormat) => {
    const value = formData[column.key] || '';
    const { fieldConfig } = column;

    switch (fieldConfig.type) {
      case 'option':
        return (
          <StatusDropdown
            options={fieldConfig.options || []}
            value={value}
            onChange={(value) => handleInputChange(column.key, value)}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={column.key}
            name={column.key}
            value={formatDateForInput(value)}
            onChange={(e) => handleInputChange(column.key, e.target.value)}
            className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
          />
        );

      case 'email':
        return (
          <input
            type="email"
            id={column.key}
            name={column.key}
            value={value}
            onChange={(e) => handleInputChange(column.key, e.target.value)}
            className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
          />
        );

      case 'number':
      case 'currency':
        return (
          <input
            type="number"
            id={column.key}
            name={column.key}
            value={value}
            onChange={(e) => handleInputChange(column.key, e.target.value)}
            step={fieldConfig.type === 'currency' ? "0.01" : "1"}
            className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
          />
        );

      case 'longtext':
        return (
          <textarea
            id={column.key}
            name={column.key}
            value={value}
            onChange={(e) => handleInputChange(column.key, e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
          />
        );

      default:
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const processedData = Object.entries(formData).reduce((acc, [key, value]) => {
        const column = columns.find(col => col.key === key);
        if (!column) return acc;

        switch (column.fieldConfig.type) {
          case 'date':
            if (value) {
              acc[key] = new Date(value).toISOString();
            }
            break;
          case 'number':
          case 'currency':
            if (value) {
              acc[key] = parseFloat(value);
            }
            break;
          default:
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
            {formColumns.map((column) => (
              <div key={column.key}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {column.fieldConfig.label}
                </label>
                {renderInput(column)}
              </div>
            ))}
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
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
    if (keyLower === 'lastcontact' || keyLower.includes('date')) return 'datetime-local';
    return 'text';
  };

  const formatDateForInput = (value: string): string => {
    if (!value) return '';
    try {
      const date = new Date(value);
      // Format: YYYY-MM-DDThh:mm
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const handleInputChange = (key: string, value: string) => {
    // For date fields, ensure we store as ISO string
    const keyLower = key.toLowerCase();
    if (keyLower === 'lastcontact' || keyLower.includes('date')) {
      const dateValue = value ? new Date(value).toISOString() : '';
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
      // Add current timestamp for createdAt and updatedAt
      const now = new Date().toISOString();
      const dataToSubmit = {
        ...formData,
        createdAt: now,
        updatedAt: now
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
                  <input
                    type={inputType}
                    value={value}
                    onChange={(e) => handleInputChange(column.key, e.target.value)}
                    className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
                  />
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
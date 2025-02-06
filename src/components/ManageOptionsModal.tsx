import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash } from 'react-icons/fi';
import { TwitterPicker } from 'react-color';

interface Option {
  id: number;
  label: string;
  value: string;
  color: string;
}

interface ManageOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  columnName: string;
  onSuccess?: () => void;
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];

export default function ManageOptionsModal({
  isOpen,
  onClose,
  tableName,
  columnName,
  onSuccess
}: ManageOptionsModalProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingColorId, setEditingColorId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, tableName, columnName]);

  const fetchOptions = async () => {
    try {
      const response = await fetch(`/api/tables/${tableName}/options/${columnName}`);
      if (!response.ok) throw new Error('Failed to fetch options');
      const data = await response.json();
      setOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch options');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    const newOption = {
      id: -Date.now(), // Temporary negative ID for new options
      label: '',
      value: '',
      color: DEFAULT_COLORS[0],
    };
    setOptions([...options, newOption]);
  };

  const handleUpdateOption = (id: number, field: string, value: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
  };

  const handleDeleteOption = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this option?')) return;

    try {
      if (id > 0) { // Only make API call for existing options
        const response = await fetch(`/api/tables/${tableName}/options/${columnName}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optionId: id }),
        });
        if (!response.ok) throw new Error('Failed to delete option');
      }
      setOptions(options.filter(opt => opt.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete option');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/tables/${tableName}/options/${columnName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options: options.map((opt, index) => ({
            ...opt,
            sortOrder: index,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save options');
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save options');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1f1f1f] rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Manage Options for {columnName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-500 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Label"
                value={option.label}
                onChange={(e) => handleUpdateOption(option.id, 'label', e.target.value)}
                className="flex-1 bg-[#2f2f2f] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="relative">
                <button
                  onClick={() => setEditingColorId(editingColorId === option.id ? null : option.id)}
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: option.color }}
                />
                {editingColorId === option.id && (
                  <div className="absolute top-full right-0 mt-2 z-10">
                    <TwitterPicker
                      color={option.color}
                      colors={DEFAULT_COLORS}
                      onChange={(color) => {
                        handleUpdateOption(option.id, 'color', color.hex);
                        setEditingColorId(null);
                      }}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteOption(option.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <FiTrash size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleAddOption}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
          >
            <FiPlus size={18} />
            Add Option
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
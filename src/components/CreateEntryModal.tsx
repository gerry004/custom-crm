import React from 'react';
import { FiX } from 'react-icons/fi';

interface CreateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'customers' | 'leads';
}

const CreateEntryModal = ({ isOpen, onClose, type }: CreateEntryModalProps) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    onClose();
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
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEntryModal; 
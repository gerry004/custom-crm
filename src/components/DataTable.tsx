import React from 'react';
import { FiSearch } from 'react-icons/fi';
import CreateEntryModal from './CreateEntryModal';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  type: 'customers' | 'leads';
}

const DataTable = ({ columns, data, type }: DataTableProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatCellValue = (value: any, key: string) => {
    if (value === null || value === undefined) return '';
    
    // Check if the field is a date field
    if (['lastContact', 'createdAt', 'updatedAt'].includes(key) && value) {
      return formatDate(value);
    }
    return value;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold capitalize">{type}</h2>
          <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
            {data.length}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((row, index) => (
              <tr
                key={index}
                className="text-gray-300 hover:bg-[#2f2f2f] cursor-pointer"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 text-sm whitespace-nowrap"
                  >
                    {formatCellValue(row[column.key], column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
      />
    </div>
  );
};

export default DataTable; 
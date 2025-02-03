'use client';

import React from 'react';
import { FiSearch, FiTrash2, FiMove, FiEdit2, FiChevronUp, FiChevronDown, FiPlus, FiX, FiFilter } from 'react-icons/fi';
import CreateEntryModal from './CreateEntryModal';
import StatusDropdown, {
  STATUS_COLORS,
} from './StatusDropdown';
import { ColumnFormat, toDbColumn, formatCellValue } from '@/utils/columnTransformers';
import { searchObjects } from '@/utils/searchUtils';

interface DataTableProps {
  columns: ColumnFormat[];
  data: any[];
  type: 'customers' | 'leads' | 'tasks';
  onRefresh?: () => void;
  searchableFields?: string[];
}

const TIMESTAMP_FIELDS = ['createdAt', 'updatedAt'] as const;
const DATE_FORMAT_FIELDS = ['lastContact', 'createdAt', 'updatedAt', 'dueDate'] as const;

const PRIORITY_COLORS = {
  'Low': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  'Medium': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  'High': 'bg-red-500/20 text-red-500 border-red-500/50',
} as const;

const CUSTOMER_STATUS_COLORS = {
  'Active': 'bg-green-500/20 text-green-500 border-green-500/50',
  'Inactive': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  'Pending': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
} as const;

const LEAD_STATUS_COLORS = {
  'New': 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  'Contacted': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  'Qualified': 'bg-green-500/20 text-green-500 border-green-500/50',
  'Lost': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
} as const;

interface SortItem {
  key: string;
  direction: 'asc' | 'desc';
}

const SortConfigPanel = ({ 
  sortConfig, 
  setSortConfig, 
  columns 
}: { 
  sortConfig: SortItem[];
  setSortConfig: React.Dispatch<React.SetStateAction<SortItem[]>>;
  columns: ColumnFormat[];
}) => {
  const availableColumns = columns.filter(
    col => !sortConfig.find(sort => sort.key === col.key)
  );

  const handleAddSort = () => {
    if (availableColumns.length === 0) return;
    setSortConfig(current => [...current, { key: availableColumns[0].key, direction: 'asc' }]);
  };

  const handleRemoveSort = (index: number) => {
    setSortConfig(current => current.filter((_, i) => i !== index));
  };

  const handleChangeColumn = (index: number, key: string) => {
    setSortConfig(current => current.map((item, i) => 
      i === index ? { ...item, key } : item
    ));
  };

  const handleToggleDirection = (index: number) => {
    setSortConfig(current => current.map((item, i) => 
      i === index ? { ...item, direction: item.direction === 'asc' ? 'desc' : 'asc' } : item
    ));
  };

  if (sortConfig.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-[#2f2f2f] rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-300">Sort Configuration</h3>
        {availableColumns.length > 0 && (
          <button
            onClick={handleAddSort}
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
          >
            <FiPlus size={14} />
            Add Sort
          </button>
        )}
      </div>
      <div className="space-y-2">
        {sortConfig.map((sort, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={sort.key}
              onChange={(e) => handleChangeColumn(index, e.target.value)}
              className="bg-[#3f3f3f] text-sm text-gray-300 rounded px-2 py-1 border border-gray-600"
            >
              <option value={sort.key}>
                {columns.find(col => col.key === sort.key)?.label}
              </option>
              {availableColumns.map(col => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleToggleDirection(index)}
              className="flex items-center gap-1 px-2 py-1 bg-[#3f3f3f] rounded text-sm text-gray-300"
            >
              {sort.direction === 'asc' ? (
                <FiChevronUp size={14} className="text-blue-400" />
              ) : (
                <FiChevronDown size={14} className="text-blue-400" />
              )}
            </button>
            <button
              onClick={() => handleRemoveSort(index)}
              className="text-gray-400 hover:text-red-400"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const DataTable = ({ columns, data, type, onRefresh, searchableFields }: DataTableProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingCell, setEditingCell] = React.useState<{
    id: number;
    key: string;
    value: any;
  } | null>(null);
  const [localData, setLocalData] = React.useState(data);
  const [draggedItem, setDraggedItem] = React.useState<number | null>(null);
  const [sortConfig, setSortConfig] = React.useState<SortItem[]>([]);
  const [showSortConfig, setShowSortConfig] = React.useState(false);

  // Define default searchable fields based on type
  const defaultSearchFields = React.useMemo(() => {
    switch (type) {
      case 'tasks':
        return ['title', 'description', 'status', 'priority'];
      case 'leads':
      case 'customers':
        return ['name', 'email', 'phone', 'status'];
      default:
        return ['name', 'title'];
    }
  }, [type]);

  // Update the sorting function to handle multiple columns
  const sortData = React.useCallback((data: any[], sortItems: SortItem[]) => {
    if (!sortItems.length) return data;

    return [...data].sort((a, b) => {
      for (const { key, direction } of sortItems) {
        const aValue = a[key];
        const bValue = b[key];

        // Skip to next sort criteria if values are equal
        if (aValue === bValue) continue;

        // Handle null/undefined values
        if (aValue == null) return direction === 'asc' ? -1 : 1;
        if (bValue == null) return direction === 'asc' ? 1 : -1;

        // Handle dates
        if (DATE_FORMAT_FIELDS.includes(key as any)) {
          const comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
          return direction === 'asc' ? comparison : -comparison;
        }

        // Handle strings and numbers
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return direction === 'asc' ? comparison : -comparison;
        }

        const comparison = aValue - bValue;
        return direction === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  }, []);

  // Update filteredData to use new sorting
  const filteredData = React.useMemo(() => {
    const searchResults = searchObjects(
      localData,
      searchQuery,
      searchableFields || defaultSearchFields
    );
    return sortData(searchResults, sortConfig);
  }, [localData, searchQuery, searchableFields, defaultSearchFields, sortConfig, sortData]);

  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

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

      // Remove the deleted item from localData
      setLocalData(prevData => prevData.filter(item => item.id !== id));
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCellEdit = async (id: number, key: string, newValue: any) => {
    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry');
      }

      const updatedEntry = await response.json();
      
      setLocalData(prevData => 
        prevData.map(item => item.id === id ? updatedEntry : item)
      );
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry');
    } finally {
      setEditingCell(null);
    }
  };

  const handleInputKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>, row: any) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      if (editingCell) {
        setEditingCell({
          ...editingCell,
          value: row[editingCell.key]
        });
      }
      setEditingCell(null);
    }
  }, [editingCell]);

  const handleInputBlur = React.useCallback((row: any) => {
    if (!editingCell) return;
    
    if (editingCell.value !== row[editingCell.key]) {
      handleCellEdit(row.id, editingCell.key, editingCell.value);
    } else {
      setEditingCell(null);
    }
  }, [editingCell]);

  const formatDate = React.useCallback((dateString: string) => {
    const date = new Date(dateString);
    return [
      date.getDate().toString().padStart(2, '0'),
      '/',
      (date.getMonth() + 1).toString().padStart(2, '0'),
      '/',
      date.getFullYear()
    ].join('');
  }, []);

  const formatCellDisplay = React.useCallback((value: any, key: string) => {
    if (value === null || value === undefined) return '';
    
    if (DATE_FORMAT_FIELDS.includes(key as any) && value) {
      return formatDate(value);
    }

    if (key === 'status') {
      if (type === 'tasks') {
        return (
          <span className={`px-2 py-1 rounded-full text-sm border ${STATUS_COLORS[value as keyof typeof STATUS_COLORS]}`}>
            {value}
          </span>
        );
      }
      if (type === 'customers') {
        return (
          <span className={`px-2 py-1 rounded-full text-sm border ${CUSTOMER_STATUS_COLORS[value as keyof typeof CUSTOMER_STATUS_COLORS]}`}>
            {value}
          </span>
        );
      }
      if (type === 'leads') {
        return (
          <span className={`px-2 py-1 rounded-full text-sm border ${LEAD_STATUS_COLORS[value as keyof typeof LEAD_STATUS_COLORS]}`}>
            {value}
          </span>
        );
      }
    }

    if (key === 'priority' && type === 'tasks') {
      return (
        <span className={`px-2 py-1 rounded-full text-sm border ${PRIORITY_COLORS[value as keyof typeof PRIORITY_COLORS]}`}>
          {value}
        </span>
      );
    }

    return formatCellValue(value, key);
  }, [formatDate, type]);

  const handleCellClick = React.useCallback((column: ColumnFormat, row: any) => {
    if (TIMESTAMP_FIELDS.includes(column.key as any)) return;
    
    if ((type === 'tasks' && (column.key === 'status' || column.key === 'priority')) ||
        (type === 'customers' && column.key === 'status') ||
        (type === 'leads' && column.key === 'status')) {
      setEditingCell({
        id: row.id,
        key: column.key,
        value: row[column.key],
      });
      return;
    }

    setEditingCell({
      id: row.id,
      key: column.key,
      value: row[column.key],
    });
  }, [type]);

  const handleReorder = async (fromId: number, toId: number) => {
    if (fromId === toId) return;

    try {
      const response = await fetch(`/api/${type}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromId, toId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder items');
      }

      // Update local state to reflect the new order
      setLocalData(prevData => {
        const newData = [...prevData];
        const fromIndex = newData.findIndex(item => item.id === fromId);
        const toIndex = newData.findIndex(item => item.id === toId);
        
        const [movedItem] = newData.splice(fromIndex, 1);
        newData.splice(toIndex, 0, movedItem);
        
        return newData;
      });

      onRefresh?.();
    } catch (error) {
      console.error('Error reordering items:', error);
      alert('Failed to reorder items');
    }
  };

  const handleSubmit = async (formData: any) => {
    const dbFormattedData = Object.keys(formData).reduce((acc, key) => {
      const dbKey = toDbColumn(key);
      acc[dbKey] = formData[key];
      return acc;
    }, {} as Record<string, any>);

    // Now send dbFormattedData to your API
    // ...
  };

  // Simplify handleSort to just toggle between asc/desc for a single column
  const handleSort = (key: string) => {
    setSortConfig(current => {
      // If clicking the same column, toggle direction
      if (current[0]?.key === key) {
        if (current[0].direction === 'asc') {
          return [{ key, direction: 'desc' }];
        }
        return [];
      }
      // If clicking a new column, sort ascending
      return [{ key, direction: 'asc' }];
    });
  };

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
            onClick={() => setShowSortConfig(!showSortConfig)}
            className={`px-3 py-2 rounded-md border transition-colors ${
              showSortConfig || sortConfig.length > 0
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
                : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
            title="Toggle sort configuration"
          >
            <FiFilter size={18} />
          </button>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => setIsModalOpen(true)}
          >
            New {type.slice(0, -1)}
          </button>
        </div>
      </div>

      {showSortConfig && (
        <SortConfigPanel 
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          columns={columns}
        />
      )}

      <div className="bg-[#191919] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#2f2f2f] text-gray-300">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-sm font-medium"
                >
                  <button
                    className="flex items-center gap-2 hover:text-white w-full"
                    onClick={() => handleSort(column.key)}
                  >
                    <span className="flex-grow">{column.label}</span>
                    {sortConfig[0]?.key === column.key && (
                      <span className="text-blue-400">
                        {sortConfig[0].direction === 'asc' ? (
                          <FiChevronUp size={16} />
                        ) : (
                          <FiChevronDown size={16} />
                        )}
                      </span>
                    )}
                  </button>
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
                  key={row.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedItem(row.id);
                    e.currentTarget.classList.add('opacity-50');
                  }}
                  onDragEnd={(e) => {
                    setDraggedItem(null);
                    e.currentTarget.classList.remove('opacity-50');
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-[#3f3f3f]');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-[#3f3f3f]');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-[#3f3f3f]');
                    if (draggedItem !== null && draggedItem !== row.id) {
                      handleReorder(draggedItem, row.id);
                    }
                  }}
                  className="text-gray-300 hover:bg-[#2f2f2f] transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm whitespace-nowrap cursor-pointer hover:bg-[#3f3f3f] transition-colors relative ${
                        column.key === 'status' || 
                        column.key === 'priority' || 
                        DATE_FORMAT_FIELDS.includes(column.key as any)
                          ? 'text-center'
                          : ''
                      }`}
                      onClick={() => handleCellClick(column, row)}
                    >
                      {editingCell?.id === row.id && editingCell?.key === column.key ? (
                        ((type === 'tasks' && (column.key === 'status' || column.key === 'priority')) ||
                         (type === 'customers' && column.key === 'status') ||
                         (type === 'leads' && column.key === 'status')) ? (
                          <div className="flex justify-center">
                            <StatusDropdown
                              type={
                                type === 'tasks'
                                  ? column.key === 'status'
                                    ? 'task-status'
                                    : 'task-priority'
                                  : type === 'customers'
                                  ? 'customer-status'
                                  : 'lead-status'
                              }
                              value={editingCell.value}
                              onChange={(value) => handleCellEdit(row.id, column.key, value)}
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            autoFocus
                            className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingCell.value || ''}
                            onChange={(e) =>
                              setEditingCell({
                                ...editingCell,
                                value: e.target.value,
                              })
                            }
                            onBlur={() => handleInputBlur(row)}
                            onKeyDown={(e) => handleInputKeyDown(e, row)}
                          />
                        )
                      ) : (
                        <>
                          <div className={`flex items-center ${
                            column.key === 'status' || 
                            column.key === 'priority' || 
                            DATE_FORMAT_FIELDS.includes(column.key as any)
                              ? 'justify-center'
                              : ''
                          }`}>
                            {formatCellDisplay(row[column.key], column.key)}
                          </div>
                          <div className="absolute top-2 right-2">
                            <FiEdit2 
                              size={14} 
                              className="opacity-0 group-hover:opacity-50 hover:opacity-100 text-gray-400"
                            />
                          </div>
                        </>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        className="text-gray-400 hover:text-gray-300 transition-colors cursor-move"
                        title="Move"
                      >
                        <FiMove size={18} />
                      </button>
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
                    </div>
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

export default React.memo(DataTable); 
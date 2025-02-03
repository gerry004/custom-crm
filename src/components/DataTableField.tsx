import React from 'react';
import { ColumnFormat } from '@/types/fieldTypes';
import StatusDropdown from './StatusDropdown';

interface DataTableFieldProps {
  column: ColumnFormat;
  value: any;
  isEditing: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
}

export const DataTableField: React.FC<DataTableFieldProps> = ({
  column,
  value,
  isEditing,
  onChange,
  onBlur
}) => {
  const { fieldConfig } = column;

  if (isEditing) {
    switch (fieldConfig.type) {
      case 'option':
        return (
          <StatusDropdown
            options={fieldConfig.options || []}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            autoFocus
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-full"
            autoFocus
          />
        );
      
      // Add other field type editors...
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-full"
            autoFocus
          />
        );
    }
  }

  // Display mode
  switch (fieldConfig.type) {
    case 'option': {
      const option = fieldConfig.options?.find(opt => opt.value === value);
      return option ? (
        <span className={`px-2 py-1 rounded-full text-sm border ${option.color}`}>
          {option.label}
        </span>
      ) : value;
    }

    case 'date':
      return value ? new Date(value).toLocaleDateString() : '';

    case 'currency':
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value || 0);

    default:
      return value;
  }
}; 
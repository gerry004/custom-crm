import React from 'react';
import { ColumnFormat, FieldConfig } from '@/types/fieldTypes';
import StatusDropdown from './StatusDropdown';
import { formatDateForDisplay, formatDateForInput } from '@/utils/dateFormatter';

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

  if (isEditing && !fieldConfig.readOnly) {
    return <EditableField 
      fieldConfig={fieldConfig}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />;
  }

  return <DisplayField fieldConfig={fieldConfig} value={value} />;
};

const EditableField: React.FC<{
  fieldConfig: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
}> = ({ fieldConfig, value, onChange, onBlur }) => {
  switch (fieldConfig.type) {
    case 'option':
      return (
        <StatusDropdown
          options={fieldConfig.options}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoFocus
        />
      );

    case 'date':
    case 'timestamp':
      return (
        <input
          type="date"
          value={formatDateForInput(value)}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-full"
          autoFocus
        />
      );

    case 'number':
    case 'currency':
      return (
        <input
          type="number"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          step={fieldConfig.step}
          min={fieldConfig.min}
          max={fieldConfig.max}
          className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-full"
          autoFocus
        />
      );

    case 'longtext':
      return (
        <textarea
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-full"
          autoFocus
        />
      );

    default:
      return (
        <input
          type={fieldConfig.type}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-full"
          autoFocus
        />
      );
  }
};

const DisplayField: React.FC<{
  fieldConfig: FieldConfig;
  value: any;
}> = ({ fieldConfig, value }) => {
  if (value == null) return null;

  switch (fieldConfig.type) {
    case 'option': {
      const option = fieldConfig.options.find(opt => opt.value === value);
      return option ? (
        <span className={`px-2 py-1 rounded-full text-sm border ${option.color}`}>
          {option.label}
        </span>
      ) : value;
    }

    case 'date':
    case 'timestamp':
      return formatDateForDisplay(value);

    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);

    default:
      return value;
  }
}; 
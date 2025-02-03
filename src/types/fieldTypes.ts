export type FieldType = 
  | 'text'
  | 'number'
  | 'date'
  | 'option'
  | 'email'
  | 'phone'
  | 'url'
  | 'currency'
  | 'longtext';

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface FieldConfig {
  type: FieldType;
  options?: readonly FieldOption[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

export interface ColumnFormat {
  key: string;
  label: string;
  dbColumn: string;
  fieldConfig: FieldConfig;
}

// Centralized status/priority configurations
export const FIELD_CONFIGS = {
  taskStatus: {
    type: 'option' as const,
    options: [
      { value: 'To Do', label: 'To Do', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
      { value: 'In Progress', label: 'In Progress', color: 'bg-blue-500/20 text-blue-500 border-blue-500/50' },
      { value: 'Done', label: 'Done', color: 'bg-green-500/20 text-green-500 border-green-500/50' },
    ]
  },
  customerStatus: {
    type: 'option' as const,
    options: [
      { value: 'Active', label: 'Active', color: 'bg-green-500/20 text-green-500 border-green-500/50' },
      { value: 'Inactive', label: 'Inactive', color: 'bg-gray-500/20 text-gray-300 border-gray-500/50' },
      { value: 'Pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
    ]
  },
  leadStatus: {
    type: 'option' as const,
    options: [
      { value: 'New', label: 'New', color: 'bg-blue-500/20 text-blue-500 border-blue-500/50' },
      { value: 'Contacted', label: 'Contacted', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
      { value: 'Qualified', label: 'Qualified', color: 'bg-green-500/20 text-green-500 border-green-500/50' },
      { value: 'Lost', label: 'Lost', color: 'bg-gray-500/20 text-gray-300 border-gray-500/50' },
    ]
  },
  priority: {
    type: 'option' as const,
    options: [
      { value: 'Low', label: 'Low', color: 'bg-gray-500/20 text-gray-300 border-gray-500/50' },
      { value: 'Medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
      { value: 'High', label: 'High', color: 'bg-red-500/20 text-red-500 border-red-500/50' },
    ]
  },
  // Add other field configurations...
} as const; 
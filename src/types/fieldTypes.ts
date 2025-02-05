export type FieldType = 
  | 'text'
  | 'number'
  | 'date'
  | 'option'
  | 'email'
  | 'phone'
  | 'url'
  | 'currency'
  | 'longtext'
  | 'timestamp';

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface BaseFieldConfig {
  type: FieldType;
  label: string;
  required?: boolean;
  readOnly?: boolean;
  defaultValue?: any;
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'email' | 'phone' | 'url' | 'longtext';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number' | 'currency';
  min?: number;
  max?: number;
  step?: number;
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date' | 'timestamp';
  min?: string;
  max?: string;
  format?: string;
}

export interface OptionFieldConfig extends BaseFieldConfig {
  type: 'option';
  options: readonly FieldOption[];
  multiple?: boolean;
}

export type FieldConfig = 
  | TextFieldConfig 
  | NumberFieldConfig 
  | DateFieldConfig 
  | OptionFieldConfig;

export interface ColumnFormat {
  key: string;
  dbColumn: string;
  fieldConfig: FieldConfig;
}

export const FIELD_CONFIGS = {
  taskStatus: {
    type: 'option' as const,
    label: 'Status',
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
} as const; 
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

import { isDateField, formatDateForDisplay } from './dateFormatter';
import { ColumnFormat, FieldConfig, FIELD_CONFIGS } from '@/types/fieldTypes';

// Helper function to properly capitalize special terms
function formatSpecialTerms(word: string): string {
  const specialTerms: Record<string, string> = {
    'id': 'ID',
    'url': 'URL',
    'ip': 'IP',
    'api': 'API'
  };
  
  return specialTerms[word.toLowerCase()] || word;
}

// Helper to detect field type from column name and data
function detectFieldConfig(dbColumn: string): FieldConfig {
  const columnLower = dbColumn.toLowerCase();
  
  // Detect option fields (status and priority) FIRST
  if (columnLower === 'status') {
    if (dbColumn.includes('task')) return FIELD_CONFIGS.taskStatus;
    if (dbColumn.includes('customer')) return FIELD_CONFIGS.customerStatus;
    if (dbColumn.includes('lead')) return FIELD_CONFIGS.leadStatus;
    // If no specific type is found, return customerStatus as default
    return FIELD_CONFIGS.customerStatus;
  }

  if (columnLower === 'priority') {
    return FIELD_CONFIGS.priority;
  }

  // THEN detect date fields
  if (columnLower.includes('date') || 
      (columnLower.includes('at') && !columnLower.includes('status')) || 
      ['last_contact', 'created_at', 'updated_at', 'due_date'].includes(columnLower)) {
    return { type: 'date' };
  }

  // Detect other field types
  if (columnLower.includes('email')) return { type: 'email' };
  if (columnLower.includes('phone')) return { type: 'phone' };
  if (columnLower.includes('amount') || columnLower.includes('price')) return { type: 'currency' };
  if (columnLower.includes('description')) return { type: 'longtext' };
  
  // Default to text
  return { type: 'text' };
}

export function formatColumnName(dbColumn: string): ColumnFormat {
  if (!dbColumn || typeof dbColumn !== 'string') {
    throw new Error(`Invalid column name: ${dbColumn}`);
  }

  const key = dbColumn
    .toLowerCase()
    .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

  const label = dbColumn
    .split('_')
    .map(word => formatSpecialTerms(word))
    .join(' ');

  const fieldConfig = detectFieldConfig(dbColumn);

  return {
    key,
    label,
    dbColumn,
    fieldConfig
  };
}

export function formatColumns(dbColumns: string[]): ColumnFormat[] {
  if (!Array.isArray(dbColumns)) {
    console.warn('formatColumns received invalid input:', dbColumns);
    return [];
  }
  
  return dbColumns.map(dbColumn => {
    try {
      return formatColumnName(dbColumn);
    } catch (error) {
      console.error(`Error formatting column ${dbColumn}:`, error);
      // Return a default column format if there's an error
      return {
        key: dbColumn,
        label: dbColumn,
        dbColumn: dbColumn,
        fieldConfig: { type: 'text' }
      };
    }
  });
}

// Convert camelCase back to snake_case for database operations
export function toDbColumn(key: string): string {
  return key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Format cell value based on column type
export function formatCellValue(value: any, key: string): any {
  if (value === null || value === undefined) return '';
  
  // Handle date fields
  if (isDateField(key)) {
    return formatDateForDisplay(value);
  }

  // Handle ID fields - ensure they're displayed as numbers
  if (key.toLowerCase().endsWith('id')) {
    return Number(value);
  }

  return value;
} 
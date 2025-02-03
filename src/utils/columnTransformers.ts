import { ColumnFormat, FieldConfig, FIELD_CONFIGS } from '@/types/fieldTypes';

// Helper to detect field type from column name and data
function detectFieldConfig(dbColumn: string, value?: any): FieldConfig {
  const columnLower = dbColumn.toLowerCase();
  
  // Status fields
  if (columnLower.includes('status')) {
    if (columnLower.includes('task')) {
      return { ...FIELD_CONFIGS.taskStatus };
    }
    if (columnLower.includes('customer')) {
      return { ...FIELD_CONFIGS.customerStatus, label: 'Customer Status' };
    }
    if (columnLower.includes('lead')) {
      return { ...FIELD_CONFIGS.leadStatus, label: 'Lead Status' };
    }
    return { ...FIELD_CONFIGS.taskStatus, label: formatColumnLabel(dbColumn) };
  }

  // Priority field
  if (columnLower.includes('priority')) {
    return { ...FIELD_CONFIGS.priority, label: 'Priority' };
  }

  // Date/Timestamp fields
  if (columnLower.includes('_at') || 
      columnLower.includes('date') || 
      columnLower.includes('last_contact')) {
    return {
      type: columnLower.includes('_at') ? 'timestamp' : 'date',
      label: formatColumnLabel(dbColumn),
      readOnly: columnLower.includes('created_at') || columnLower.includes('updated_at')
    };
  }

  // Other field types
  if (columnLower.includes('email')) {
    return { type: 'email', label: formatColumnLabel(dbColumn) };
  }
  if (columnLower.includes('phone')) {
    return { type: 'phone', label: formatColumnLabel(dbColumn) };
  }
  if (columnLower.includes('amount') || columnLower.includes('price')) {
    return { 
      type: 'currency',
      label: formatColumnLabel(dbColumn),
      step: 0.01,
      min: 0
    };
  }
  if (columnLower.includes('description')) {
    return { type: 'text', label: formatColumnLabel(dbColumn) };
  }

  // Default to text
  return { type: 'text', label: formatColumnLabel(dbColumn) };
}

function formatColumnLabel(dbColumn: string): string {
  return dbColumn
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatColumnName(dbColumn: string): ColumnFormat {
  const key = dbColumn
    .toLowerCase()
    .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

  const fieldConfig = detectFieldConfig(dbColumn);

  return {
    key,
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
      return {
        key: dbColumn,
        dbColumn: dbColumn,
        fieldConfig: { type: 'text', label: dbColumn }
      };
    }
  });
}

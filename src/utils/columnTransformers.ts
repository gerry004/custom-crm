import { ColumnFormat, FieldConfig, FIELD_CONFIGS } from '@/types/fieldTypes';

async function getFieldOptions(tableName: string, columnName: string) {
  try {
    const response = await fetch(
      `/api/field-options?table=${tableName}&column=${columnName}`
    );
    if (!response.ok) throw new Error('Failed to fetch options');
    return await response.json();
  } catch (error) {
    console.error('Error fetching field options:', error);
    return [];
  }
}

// Helper to detect field type from column name and data
async function detectFieldConfig(dbColumn: string, tableName: string): Promise<FieldConfig> {
  const columnLower = dbColumn.toLowerCase();
  
  // First check if this field has any options in the database
  const options = await getFieldOptions(tableName, columnLower);
  if (options.length > 0) {
    return {
      type: 'option',
      label: formatColumnLabel(dbColumn),
      options
    };
  }

  // If no options found, continue with other field type detection
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
    return { type: 'longtext', label: formatColumnLabel(dbColumn) };
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

export async function formatColumnName(dbColumn: string, tableName: string): Promise<ColumnFormat> {
  const key = dbColumn
    .toLowerCase()
    .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

  const fieldConfig = await detectFieldConfig(dbColumn, tableName);

  return {
    key,
    dbColumn,
    fieldConfig
  };
}

export async function formatColumns(dbColumns: string[], tableName: string): Promise<ColumnFormat[]> {
  if (!Array.isArray(dbColumns)) {
    console.warn('formatColumns received invalid input:', dbColumns);
    return [];
  }
  
  const formattedColumns = await Promise.all(
    dbColumns.map(dbColumn => formatColumnName(dbColumn, tableName))
  );
  
  return formattedColumns;
}

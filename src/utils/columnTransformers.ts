import { ColumnFormat, FieldConfig, FieldType } from '@/types/fieldTypes';

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

// Helper to detect field type from schema data type
function getFieldTypeFromSchema(dataType: string, udtName: string): FieldType {
  switch (dataType.toLowerCase()) {
    case 'timestamp':
    case 'timestamp without time zone':
    case 'timestamp with time zone':
    case 'date':
      return dataType === 'date' ? 'date' : 'timestamp';
    
    case 'numeric':
    case 'decimal':
    case 'real':
    case 'double precision':
    case 'integer':
    case 'bigint':
    case 'smallint':
      return 'number';
    
    case 'character varying':
    case 'text':
      switch (udtName.toLowerCase()) {
        case 'email':
          return 'email';
        case 'phone':
          return 'phone';
        case 'url':
          return 'url';
        default:
          return 'text';
      }
    
    default:
      return 'text';
  }
}

// Helper to detect field type from column info
async function detectFieldConfig(
  dbColumn: string, 
  tableName: string,
  dataType: string,
  udtName: string
): Promise<FieldConfig> {
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

  // Get base type from schema
  const baseType = getFieldTypeFromSchema(dataType, udtName);

  // Customize config based on type and column
  switch (baseType) {
    case 'timestamp':
    case 'date':
      return {
        type: baseType,
        label: formatColumnLabel(dbColumn),
        readOnly: columnLower.includes('created_at') || columnLower.includes('updated_at')
      };

    case 'number':
      if (columnLower.includes('amount') || columnLower.includes('price')) {
        return {
          type: 'currency',
          label: formatColumnLabel(dbColumn),
          step: 0.01,
          min: 0
        };
      }
      return {
        type: 'number',
        label: formatColumnLabel(dbColumn)
      };

    default:
      return {
        type: 'text' as const,
        label: formatColumnLabel(dbColumn)
      };
  }
}

function formatColumnLabel(dbColumn: string): string {
  return dbColumn
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function formatColumnName(
  column: { column_name: string; data_type: string; udt_name: string }, 
  tableName: string
): Promise<ColumnFormat> {
  const key = column.column_name
    .toLowerCase()
    .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

  const fieldConfig = await detectFieldConfig(
    column.column_name, 
    tableName, 
    column.data_type,
    column.udt_name
  );

  return {
    key,
    dbColumn: column.column_name,
    fieldConfig
  };
}

export async function formatColumns(
  columns: Array<{ column_name: string; data_type: string; udt_name: string }>, 
  tableName: string
): Promise<ColumnFormat[]> {
  if (!Array.isArray(columns)) {
    console.warn('formatColumns received invalid input:', columns);
    return [];
  }
  
  const formattedColumns = await Promise.all(
    columns.map(column => formatColumnName(column, tableName))
  );
  
  return formattedColumns;
}

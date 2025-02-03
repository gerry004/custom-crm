import { isDateField, formatDateForDisplay } from './dateFormatter';

export type ColumnFormat = {
  key: string;      // camelCase for frontend state
  label: string;    // Title Case with spaces for display
  dbColumn: string; // snake_case for database operations
};

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

export function formatColumnName(dbColumn: string): ColumnFormat {
  // Convert to camelCase for key
  const key = dbColumn
    .toLowerCase()
    .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

  // Create proper label with special cases
  const label = dbColumn
    .split('_')
    .map(word => {
      const formattedWord = formatSpecialTerms(word);
      return formattedWord === word 
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : formattedWord;
    })
    .join(' ');

  return {
    key,
    label,
    dbColumn
  };
}

export function formatColumns(columns: string[]): ColumnFormat[] {
  return columns.map(formatColumnName);
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
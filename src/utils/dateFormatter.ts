export const DATE_FIELDS = [
  'dueDate',
  'startDate',
  'endDate',
  'lastContact',
  'createdAt',
  'updatedAt'
] as const;

export type DateField = typeof DATE_FIELDS[number];

// For display in table cells
export function formatDateForDisplay(date: string | Date | null): string {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '';
  }
}

// For form inputs (YYYY-MM-DD)
export function formatDateForInput(date: string | Date | null): string {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// Check if a field is a date field
export function isDateField(field: string): boolean {
  return DATE_FIELDS.includes(field as DateField) || field.toLowerCase().includes('date');
} 
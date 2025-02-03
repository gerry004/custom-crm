type SearchableObject = {
  [key: string]: any;
};

export function searchObjects<T extends SearchableObject>(
  items: T[],
  searchQuery: string,
  searchableFields: string[] = ['name', 'title', 'description', 'email']
): T[] {
  if (!searchQuery) return items;
  
  const query = searchQuery.toLowerCase().trim();
  
  return items.filter(item => {
    return searchableFields.some(field => {
      const value = item[field];
      if (value == null) return false;
      return String(value).toLowerCase().includes(query);
    });
  });
} 
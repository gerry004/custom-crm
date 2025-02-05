import { PrismaClient } from '@prisma/client';

export type TableName = 'leads' | 'tasks' | 'finances' | 'customers';

interface TableConfig {
  defaultStatus?: string;
  defaultPriority?: string;
  dateFields?: string[];
  numberFields?: string[];
}

export const tableConfigs: Record<TableName, TableConfig> = {
  leads: {
    defaultStatus: 'New'
  },
  tasks: {
    defaultStatus: 'To Do',
    defaultPriority: 'Medium',
    dateFields: ['dueDate']
  },
  finances: {
    dateFields: ['date'],
    numberFields: ['amount']
  },
  customers: {
    defaultStatus: 'Pending',
    dateFields: ['lastContact']
  }
};

export function getTableName(table: string): TableName | null {
  if (isValidTable(table)) {
    return table as TableName;
  }
  return null;
}

export function isValidTable(table: string): table is TableName {
  return Object.keys(tableConfigs).includes(table);
}

export function getPrismaModel(prisma: PrismaClient, table: TableName) {
  const modelMap = {
    leads: prisma.lead,
    tasks: prisma.task,
    finances: prisma.finance,
    customers: prisma.customer
  };
  return modelMap[table];
}

export function processData(data: any, table: TableName) {
  const config = tableConfigs[table];
  const processed = { ...data };

  // Handle date fields
  config.dateFields?.forEach(field => {
    if (data[field]) {
      processed[field] = new Date(data[field]);
    }
  });

  // Handle number fields
  config.numberFields?.forEach(field => {
    if (data[field] !== undefined) {
      processed[field] = parseFloat(data[field]);
      if (isNaN(processed[field])) {
        throw new Error(`${field} must be a valid number`);
      }
    }
  });

  // Set default status if applicable
  if (config.defaultStatus && !data.status) {
    processed.status = config.defaultStatus;
  }

  // Set default priority if applicable
  if (config.defaultPriority && !data.priority) {
    processed.priority = config.defaultPriority;
  }

  return processed;
} 
import { PrismaClient } from '@prisma/client';

export const MODEL_MAP = {
  tasks: 'task',
  leads: 'lead',
  customers: 'customer',
  finances: 'finance'
} as const;

export type TableName = keyof typeof MODEL_MAP;
export type ModelName = (typeof MODEL_MAP)[TableName];

export function getTableName(table: string): ModelName | null {
  return MODEL_MAP[table as TableName] || null;
}

export function getPrismaModel(prisma: PrismaClient, tableName: ModelName) {
  return prisma[tableName] as any;
}

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

export function isValidTable(table: string): table is TableName {
  return Object.keys(tableConfigs).includes(table);
}

export function processData(data: any, table: string) {
  const config = tableConfigs[table as TableName];
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
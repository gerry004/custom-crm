import React from 'react';

export const TASK_STATUSES = ['To Do', 'In Progress', 'Done'] as const;
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const CUSTOMER_STATUSES = ['Active', 'Inactive', 'Pending'] as const;
export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'] as const;

export const STATUS_COLORS = {
  // Task statuses
  'To Do': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  'In Progress': 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  'Done': 'bg-green-500/20 text-green-500 border-green-500/50',
  // Customer statuses
  'Active': 'bg-green-500/20 text-green-500 border-green-500/50',
  'Inactive': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  'Pending': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  // Lead statuses
  'New': 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  'Contacted': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  'Qualified': 'bg-green-500/20 text-green-500 border-green-500/50',
  'Lost': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  // Priority colors
  'Low': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  'Medium': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  'High': 'bg-red-500/20 text-red-500 border-red-500/50',
} as const;

type DropdownType = 'task-status' | 'task-priority' | 'customer-status' | 'lead-status';

interface StatusDropdownProps {
  type: DropdownType;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

const getOptions = (type: DropdownType) => {
  switch (type) {
    case 'task-status':
      return TASK_STATUSES;
    case 'task-priority':
      return TASK_PRIORITIES;
    case 'customer-status':
      return CUSTOMER_STATUSES;
    case 'lead-status':
      return LEAD_STATUSES;
    default:
      return [];
  }
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  type,
  value,
  onChange,
  onBlur,
  autoFocus = false,
}) => {
  const options = getOptions(type);

  return (
    <div className="relative">
      <select
        autoFocus={autoFocus}
        className="w-full px-4 py-2 bg-[#2f2f2f] rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white appearance-none cursor-pointer text-[0.95rem] [&>*]:py-3 [&>*]:bg-[#2f2f2f] [&>*]:cursor-pointer [&>*]:hover:bg-[#3f3f3f] [&>*]:checked:bg-gray-700"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        style={{ WebkitAppearance: 'none' }}
      >
        <option value="" className="text-gray-400 italic py-3">Select an option</option>
        {options.map((option) => (
          <option 
            key={option} 
            value={option}
            className="text-white py-3"
          >
            {option}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default StatusDropdown; 
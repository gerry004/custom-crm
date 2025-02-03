import React from 'react';
import { FieldOption } from '@/types/fieldTypes';

interface StatusDropdownProps {
  options: readonly FieldOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  options,
  value,
  onChange,
  onBlur,
  autoFocus = false,
}) => {
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
            key={option.value} 
            value={option.value}
            className="text-white py-3"
          >
            {option.label}
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
import React from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  options: MultiSelectOption[];
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  value,
  onChange,
  label,
  placeholder,
  error,
  required = false,
  options,
}) => {
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {placeholder && value.length === 0 && (
        <p className="text-sm text-gray-500 mb-2">{placeholder}</p>
      )}
      <div className={`border rounded-md p-3 space-y-2 ${error ? 'border-red-500' : 'border-gray-300'}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
          >
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-2 focus:ring-slate-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

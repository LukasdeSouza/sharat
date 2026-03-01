import React from 'react';

interface CheckboxProps {
  value: any; // Can be boolean for single or string[] for group
  onChange: (value: any) => void;
  label: string;
  error?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onChange,
  label,
  error,
  required = false,
  options,
}) => {
  const isGroup = options && options.length > 0;

  const handleGroupChange = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (currentValues.includes(optionValue)) {
      onChange(currentValues.filter((v: string) => v !== optionValue));
    } else {
      onChange([...currentValues, optionValue]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className={isGroup ? "space-y-2" : ""}>
        {isGroup ? (
          options.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(option.value)}
                onChange={() => handleGroupChange(option.value)}
                className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-2 focus:ring-slate-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))
        ) : (
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-2 focus:ring-slate-500"
            />
            <span className="text-sm text-gray-700">
              {label}
            </span>
          </label>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

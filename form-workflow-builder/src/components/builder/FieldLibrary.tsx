import { BiCheckbox, BiSelection, BiText, BiUpload } from 'react-icons/bi';
import type { FieldType } from '../../types';
import { MdDateRange, MdEmail, MdNumbers } from 'react-icons/md';
import { RiDropdownList } from 'react-icons/ri';
import { IoRadioButtonOff } from 'react-icons/io5';

interface FieldTypeInfo {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const fieldTypes: FieldTypeInfo[] = [
  { type: 'text', label: 'Text Input', icon: <BiText />, description: 'Single line text' },
  { type: 'textarea', label: 'Text Area', icon: <BiText />, description: 'Multi-line text' },
  { type: 'number', label: 'Number Input', icon: <MdNumbers />, description: 'Numeric values' },
  { type: 'email', label: 'Email Input', icon: <MdEmail />, description: 'Email address' },
  { type: 'date', label: 'Date Picker', icon: <MdDateRange />, description: 'Date selection' },
  { type: 'dropdown', label: 'Dropdown', icon: <RiDropdownList />, description: 'Single selection' },
  { type: 'multiselect', label: 'Multi-Select', icon: <BiSelection />, description: 'Multiple selections' },
  { type: 'checkbox', label: 'Checkbox', icon: <BiCheckbox />, description: 'Boolean value' },
  { type: 'radio', label: 'Radio Button', icon: <IoRadioButtonOff />, description: 'Single choice' },
  { type: 'file', label: 'File Upload', icon: <BiUpload />, description: 'File attachment' },
];

interface FieldLibraryProps {
  onFieldSelect: (fieldType: FieldType) => void;
}

export default function FieldLibrary({ onFieldSelect }: FieldLibraryProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto h-[calc(100vh-222px)]">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Field Types</h2>
      <div className="space-y-2">
        {fieldTypes.map((field) => (
          <button
            key={field.type}
            onClick={() => onFieldSelect(field.type)}
            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('fieldType', field.type);
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <span className="text-2xl flex-shrink-0">{field.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-gray-800 group-hover:text-slate-600">
                {field.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {field.description}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
        <p className="font-medium mb-1">quick tip:</p>
        <p>Drag fields to the canvas or click to add them to your form.</p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { FieldDefinition, FieldType } from '../../types';
import { PiEmpty } from 'react-icons/pi';
import { BiTrash } from 'react-icons/bi';

interface FormCanvasProps {
  fields: FieldDefinition[];
  selectedFieldId: string | null;
  onFieldAdd: (fieldType: FieldType) => void;
  onFieldSelect: (fieldId: string) => void;
  onFieldReorder: (dragIndex: number, hoverIndex: number) => void;
  onFieldDelete: (fieldId: string) => void;
}

export default function FormCanvas({
  fields,
  selectedFieldId,
  onFieldAdd,
  onFieldSelect,
  onFieldReorder,
  onFieldDelete,
}: FormCanvasProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData('fieldType') as FieldType;

    if (fieldType) {
      onFieldAdd(fieldType);
    }

    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleFieldDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('fieldIndex', index.toString());
  };

  const handleFieldDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleFieldDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const dragIndex = parseInt(e.dataTransfer.getData('fieldIndex'));

    if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
      onFieldReorder(dragIndex, dropIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleFieldDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getFieldIcon = (type: FieldType): string => {
    const icons: Record<FieldType, string> = {
      text: '',
      textarea: '',
      number: '',
      email: '',
      date: '',
      dropdown: '',
      multiselect: '',
      checkbox: '',
      radio: '',
      file: '',
    };
    return icons[type] || '';
  };

  return (
    <div
      className="flex-1 bg-gray-50 p-6 overflow-y-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="max-w-3xl mx-auto">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-4xl mb-4"><PiEmpty /></div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Your form is empty
            </h3>
            <p className="text-gray-500">
              Drag fields from the sidebar or click on them to add to your form
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={(e) => handleFieldDragStart(e, index)}
                onDragOver={(e) => handleFieldDragOver(e, index)}
                onDrop={(e) => handleFieldDrop(e, index)}
                onDragEnd={handleFieldDragEnd}
                onClick={() => onFieldSelect(field.id)}
                className={`
                  bg-white border-2 rounded-lg p-4 cursor-move transition-all
                  ${selectedFieldId === field.id
                    ? 'border-slate-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${draggedIndex === index ? 'opacity-50' : ''}
                  ${dragOverIndex === index ? 'border-slate-400 bg-slate-50' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {getFieldIcon(field.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-gray-800">
                        {field.label || `Untitled ${field.type}`}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldDelete(field.id);
                        }}
                        className="text-gray-400 mb-1 mr-3 hover:text-red-500 transition-colors"
                        title="Delete field"
                      >
                        <BiTrash />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {field.type}
                      {field.required && (
                        <span className="ml-2 text-red-500">*</span>
                      )}
                    </div>
                    {field.placeholder && (
                      <div className="text-xs text-gray-400 mt-1">
                        Placeholder: {field.placeholder}
                      </div>
                    )}
                    {['dropdown', 'multiselect', 'radio', 'checkbox'].includes(field.type) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(field.options || []).map(opt => (
                          <span key={opt.id} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {opt.label}
                          </span>
                        ))}
                        {(field.options || []).length === 0 && (
                          <p className="text-[10px] text-slate-400 italic">No options defined</p>
                        )}
                      </div>
                    )}
                    {field.type === 'file' && field.accept && (
                      <div className="mt-2">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight block mb-1">Accepted Types</span>
                        <code className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                          {field.accept}
                        </code>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">⋮⋮</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

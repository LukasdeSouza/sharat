import { TbClick } from 'react-icons/tb';
import type { FieldDefinition, ValidationRule, ConditionalRule, ValidationType, FieldOption } from '../../types';
import { BiTrash } from 'react-icons/bi';

interface FieldConfigPanelProps {
  field: FieldDefinition | null;
  allFields: FieldDefinition[];
  onFieldUpdate: (field: FieldDefinition) => void;
  onClose: () => void;
}

export default function FieldConfigPanel({
  field,
  allFields,
  onFieldUpdate,
  onClose,
}: FieldConfigPanelProps) {
  const updateField = (updates: Partial<FieldDefinition>) => {
    if (!field) return;
    onFieldUpdate({ ...field, ...updates });
  };

  const addValidationRule = () => {
    if (!field) return;
    const newRule: ValidationRule = {
      type: 'required',
      message: 'This field is required',
    };
    updateField({
      validation: [...field.validation, newRule],
    });
  };

  const updateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    if (!field) return;
    const newValidation = [...field.validation];
    newValidation[index] = { ...newValidation[index], ...updates };
    updateField({ validation: newValidation });
  };

  const removeValidationRule = (index: number) => {
    if (!field) return;
    updateField({
      validation: field.validation.filter((_, i) => i !== index),
    });
  };

  const addConditionalRule = () => {
    if (!field) return;
    const availableFields = allFields.filter(f => f.id !== field.id);
    if (availableFields.length === 0) {
      alert('No other fields available for conditional logic');
      return;
    }

    const newRule: ConditionalRule = {
      fieldId: availableFields[0].id,
      operator: 'equals',
      value: '',
      action: 'show',
    };
    updateField({
      conditionalLogic: [...(field.conditionalLogic || []), newRule],
    });
  };

  const updateConditionalRule = (index: number, updates: Partial<ConditionalRule>) => {
    if (!field) return;
    const newLogic = [...(field.conditionalLogic || [])];
    newLogic[index] = { ...newLogic[index], ...updates };
    updateField({ conditionalLogic: newLogic });
  };

  const removeConditionalRule = (index: number) => {
    if (!field) return;
    updateField({
      conditionalLogic: field.conditionalLogic?.filter((_, i) => i !== index) || [],
    });
  };

  const addOption = () => {
    if (!field) return;
    const newOption: FieldOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: 'New Option',
      value: 'new_option',
    };
    updateField({
      options: [...(field.options || []), newOption],
    });
  };

  const updateOption = (id: string, updates: Partial<FieldOption>) => {
    if (!field) return;
    const newOptions = (field.options || []).map(opt =>
      opt.id === id ? { ...opt, ...updates } : opt
    );
    updateField({ options: newOptions });
  };

  const removeOption = (id: string) => {
    if (!field) return;
    updateField({
      options: (field.options || []).filter(opt => opt.id !== id),
    });
  };

  return (
    <div className={`bg-white border-l border-gray-200 transition-all duration-300 ease-in-out shrink-0 relative overflow-hidden ${field ? 'w-80 opacity-100' : 'w-0 opacity-0 border-l-0'
      }`}>
      <div className={`w-80 h-full flex flex-col transition-transform duration-300 ${field ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {!field ? (
          <div className="p-6 h-full border-l border-gray-200">
            <div className="flex flex-col items-center text-center text-gray-500 mt-12">
              <div className="text-4xl mb-3"><TbClick /></div>
              <p>Select a field to configure</p>
            </div>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-800">Field Settings</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
              {/* Basic Properties */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Properties</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField({ label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="Enter field label"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField({ placeholder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Value
                    </label>
                    <input
                      type="text"
                      value={field.defaultValue || ''}
                      onChange={(e) => updateField({ defaultValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="Enter default value"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={field.required}
                      onChange={(e) => updateField({ required: e.target.checked })}
                      className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                    />
                    <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                      Required field
                    </label>
                  </div>
                </div>
              </div>

              {/* Options Management (for dropdown, multiselect, radio, checkbox) */}
              {['dropdown', 'multiselect', 'radio', 'checkbox'].includes(field.type) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Field Options</h3>
                    <button
                      onClick={addOption}
                      className="text-xs text-slate-600 hover:text-slate-700 font-medium"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(field.options || []).map((option) => (
                      <div key={option.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Option</span>
                          <button
                            onClick={() => removeOption(option.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <BiTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">Label</label>
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => updateOption(option.id, { label: e.target.value })}
                              className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                              placeholder="Option Label"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-gray-500 mb-0.5 block">Value</label>
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) => updateOption(option.id, { value: e.target.value })}
                              className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                              placeholder="Option Value"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {(field.options || []).length === 0 && (
                      <p className="text-xs text-gray-500 italic text-center py-2 bg-slate-50 border border-dashed border-slate-200 rounded-md">
                        No options defined yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* File Upload Settings */}
              {field.type === 'file' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">File Upload Settings</h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Accepted File Types (extensions or mime-types, comma separated)
                    </label>
                    <input
                      type="text"
                      value={field.accept || ''}
                      onChange={(e) => updateField({ accept: e.target.value })}
                      className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder=".pdf, .jpg, image/*, audio/*"
                    />
                    <p className="mt-1 text-[10px] text-gray-400 italic">
                      Example: .pdf, .docx, image/jpeg
                    </p>
                  </div>
                </div>
              )}

              {/* Validation Rules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Validation Rules</h3>
                  <button
                    onClick={addValidationRule}
                    className="text-xs text-slate-600 hover:text-slate-700 font-medium"
                  >
                    + Add Rule
                  </button>
                </div>

                <div className="space-y-3">
                  {field.validation.map((rule, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <select
                          value={rule.type}
                          onChange={(e) =>
                            updateValidationRule(index, { type: e.target.value as ValidationType })
                          }
                          className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                          <option value="required">Required</option>
                          <option value="minLength">Min Length</option>
                          <option value="maxLength">Max Length</option>
                          <option value="minValue">Min Value</option>
                          <option value="maxValue">Max Value</option>
                          <option value="pattern">Pattern (Regex)</option>
                          <option value="email">Email Format</option>
                        </select>
                        <button
                          onClick={() => removeValidationRule(index)}
                          className="text-gray-400 hover:text-red-500 text-sm"
                        >
                          <BiTrash />
                        </button>
                      </div>

                      {['minLength', 'maxLength', 'minValue', 'maxValue', 'pattern'].includes(rule.type) && (
                        <input
                          type="text"
                          value={rule.value || ''}
                          onChange={(e) => updateValidationRule(index, { value: e.target.value })}
                          className="w-full text-sm px-2 py-1 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                          placeholder="Value"
                        />
                      )}

                      <input
                        type="text"
                        value={rule.message}
                        onChange={(e) => updateValidationRule(index, { message: e.target.value })}
                        className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                        placeholder="Error message"
                      />
                    </div>
                  ))}

                  {field.validation.length === 0 && (
                    <p className="text-xs text-gray-500 italic">No validation rules added</p>
                  )}
                </div>
              </div>

              {/* Conditional Logic */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Conditional Logic</h3>
                  <button
                    onClick={addConditionalRule}
                    className="text-xs text-slate-600 hover:text-slate-700 font-medium"
                  >
                    + Add Rule
                  </button>
                </div>

                <div className="space-y-3">
                  {(field.conditionalLogic || []).map((rule, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Rule {index + 1}</span>
                        <button
                          onClick={() => removeConditionalRule(index)}
                          className="text-gray-400 hover:text-red-500 text-sm"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="space-y-2">
                        <select
                          value={rule.action}
                          onChange={(e) =>
                            updateConditionalRule(index, { action: e.target.value as 'show' | 'hide' })
                          }
                          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                          <option value="show">Show</option>
                          <option value="hide">Hide</option>
                        </select>

                        <select
                          value={rule.fieldId}
                          onChange={(e) => updateConditionalRule(index, { fieldId: e.target.value })}
                          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                          {allFields
                            .filter(f => f.id !== field.id)
                            .map(f => (
                              <option key={f.id} value={f.id}>
                                {f.label || f.type}
                              </option>
                            ))}
                        </select>

                        <select
                          value={rule.operator}
                          onChange={(e) =>
                            updateConditionalRule(index, {
                              operator: e.target.value as ConditionalRule['operator'],
                            })
                          }
                          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                          <option value="equals">Equals</option>
                          <option value="notEquals">Not Equals</option>
                          <option value="contains">Contains</option>
                          <option value="greaterThan">Greater Than</option>
                          <option value="lessThan">Less Than</option>
                        </select>

                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => updateConditionalRule(index, { value: e.target.value })}
                          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                          placeholder="Value to compare"
                        />

                        {index > 0 && (
                          <select
                            value={rule.logicOperator || 'AND'}
                            onChange={(e) =>
                              updateConditionalRule(index, {
                                logicOperator: e.target.value as 'AND' | 'OR',
                              })
                            }
                            className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!field.conditionalLogic || field.conditionalLogic.length === 0) && (
                    <p className="text-xs text-gray-500 italic">No conditional logic added</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

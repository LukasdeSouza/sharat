import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { FieldDefinition, FieldType, FormSchema } from '../types';
import { formsService } from '../services/FormsService';
import { workflowsService } from '../services/WorkflowsService';
import { validationService } from '../services/ValidationService';
import FieldLibrary from '../components/builder/FieldLibrary';
import FormCanvas from '../components/builder/FormCanvas';
import FieldConfigPanel from '../components/builder/FieldConfigPanel';
import { useToast, ToastContainer } from '../components/Toast';
import { BiSave, BiChevronLeft, BiLoaderAlt, BiGlobe, BiCopy, BiCheckDouble, BiBot } from 'react-icons/bi';

export default function FormBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formIdQuery = searchParams.get('id');
  const toast = useToast();

  const [formName, setFormName] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [hasWorkflow, setHasWorkflow] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [circularDependencyError, setCircularDependencyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [linkCopied, setLinkCopied] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Load existing form if editing
  useEffect(() => {
    const loadForm = async () => {
      if (formIdQuery) {
        try {
          setLoading(true);
          const [existingForm, workflows] = await Promise.all([
            formsService.getForm(formIdQuery),
            workflowsService.getWorkflowsByForm(formIdQuery)
          ]);
          setFormName(existingForm.name);
          setFormDescription(existingForm.description || '');
          setFields(existingForm.fields);
          setIsPublished(existingForm.isPublished);
          setHasWorkflow(workflows.length > 0);
        } catch (err) {
          toast.error('Failed to load form');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadForm();
  }, [formIdQuery]);

  const setPublishStatus = async (newStatus: boolean) => {
    if (newStatus === isPublished) return; // Already in this status

    if (newStatus && !hasWorkflow) {
      toast.warning('You must create a workflow for this form before publishing it.');
      return;
    }

    // If form already exists, save status immediately to the backend
    if (formIdQuery) {
      try {
        await formsService.updateForm(formIdQuery, { isPublished: newStatus });
        setIsPublished(newStatus);

        if (newStatus) {
          const publicUrl = `${window.location.origin}/f/${formIdQuery}`;
          navigator.clipboard.writeText(publicUrl);
          toast.success('Form published! Public link copied to clipboard');
        } else {
          toast.info('Form reverted to draft.');
        }
      } catch (err) {
        toast.error('Failed to update publication status');
      }
    } else {
      // If new form, just update local state (will be saved with the form)
      setIsPublished(newStatus);
      if (newStatus) {
        toast.info('Save the form to generate the public link.');
      } else {
        toast.info('Form reverted to draft.');
      }
    }
  };

  const handleFieldAdd = (fieldType: FieldType) => {
    const newField: FieldDefinition = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: fieldType,
      label: `New ${fieldType} field`,
      placeholder: '',
      defaultValue: '',
      required: false,
      validation: [],
      conditionalLogic: [],
      position: { x: 0, y: fields.length * 100 },
      width: 100,
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };

  const handleFieldUpdate = (updatedField: FieldDefinition) => {
    const updatedFields = fields.map(f => (f.id === updatedField.id ? updatedField : f));
    setFields(updatedFields);
    checkCircularDependencies(updatedFields);
  };

  const checkCircularDependencies = (fieldsToCheck: FieldDefinition[]) => {
    const cycle = validationService.detectCircularDependencies(fieldsToCheck);
    if (cycle && cycle.length > 0) {
      const fieldLabels = cycle
        .map(fieldId => {
          const field = fieldsToCheck.find(f => f.id === fieldId);
          return field ? field.label : fieldId;
        })
        .join(' → ');
      setCircularDependencyError(`Circular dependency: ${fieldLabels}`);
    } else {
      setCircularDependencyError(null);
    }
  };

  const handleFieldReorder = (dragIndex: number, hoverIndex: number) => {
    const newFields = [...fields];
    const [draggedField] = newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);
    setFields(newFields);
  };

  const handleFieldDelete = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const handleGenerateWithAI = async () => {
    try {
      setAiLoading(true);
      const { fields: aiFields, suggestedName } = await formsService.generateFormWithAI(aiPrompt || 'A simple form');
      setFields(aiFields);
      setFormName(suggestedName);
      setShowAiModal(false);
      setAiPrompt('');
      toast.success('Form generated! You can edit the fields below.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate form');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (circularDependencyError) return;

    try {
      setIsSaving(true);
      const formData: Omit<FormSchema, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formName,
        description: formDescription,
        fields,
        isPublished,
        styling: {
          theme: 'light',
          primaryColor: '#3B82F6',
          backgroundColor: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
        }
      };

      if (formIdQuery) {
        await formsService.updateForm(formIdQuery, formData);
        toast.success('Form updated successfully!');
      } else {
        const newForm = await formsService.createForm(formData);
        toast.success('Form created successfully!');

        if (isPublished) {
          const url = `${window.location.origin}/f/${newForm.id}`;
          navigator.clipboard.writeText(url);
          toast.success('Public link copied!');
        }

        navigate(`/forms/builder?id=${newForm.id}`, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <BiLoaderAlt className="w-10 h-10 text-slate-400 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading form builder...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ToastContainer messages={toast.messages} onClose={toast.removeToast} />

      {/* Header with Form Metadata */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-2xl bg-white border-none outline-none focus:ring-2 focus:ring-slate-100 rounded px-2 py-1 w-full font-bold text-slate-800"
                placeholder="Form Name"
              />
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-sm text-slate-500 border-none outline-none focus:ring-2 focus:ring-slate-100 rounded px-2 py-1 w-full mt-1"
                placeholder="Add a description..."
              />
              {isPublished && formIdQuery && (
                <div className="mt-3 flex items-center gap-2 group">
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-50/50 border border-green-100 rounded-lg max-w-md">
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-white px-1.5 py-0.5 rounded shadow-sm">Public</span>
                    <p className="text-xs text-slate-600 font-medium truncate">
                      {`${window.location.origin}/f/${formIdQuery}`}
                    </p>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/f/${formIdQuery}`;
                        navigator.clipboard.writeText(url);
                        setLinkCopied(true);
                        setTimeout(() => {
                          setLinkCopied(false);
                        }, 1000)
                        toast.success('Public link copied!');
                      }}
                      className="ml-2 text-green-500 hover:text-green-700 transition-colors p-1 hover:bg-white rounded"
                    >
                      {linkCopied ? <BiCheckDouble/> : <BiCopy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setPublishStatus(false)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-xs font-bold uppercase tracking-wider ${!isPublished
                    ? 'bg-white text-slate-600 shadow-sm border border-slate-200'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {/* <BiLockAlt className="w-4 h-4" /> */}
                  Draft
                </button>
                <button
                  onClick={() => setPublishStatus(true)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-xs font-bold uppercase tracking-wider ${isPublished
                    ? 'bg-black text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  <BiGlobe className="w-4 h-4" />
                  Published
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !!circularDependencyError}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-medium ${circularDependencyError
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-black text-white hover:bg-slate-800 shadow-sm active:scale-95'
                    }`}
                >
                  {isSaving ? (
                    <BiLoaderAlt className="w-5 h-5 animate-spin" />
                  ) : (
                    <BiSave className="w-5 h-5" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium border border-slate-200 hover:border-slate-300 rounded-lg"
                >
                  <BiBot className="w-5 h-5" />
                  <span>Create with AI</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium border border-transparent hover:border-slate-200 rounded-lg"
                >
                  <BiChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>

          {/* Circular Dependency Error Banner */}
          {circularDependencyError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
              <div className="text-red-500 mt-0.5 font-bold">!</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-tight mb-1">Validation Error</p>
                <p className="text-sm font-medium text-red-800">
                  {circularDependencyError}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Builder Interface */}
      <div className="flex-1 flex overflow-hidden">
        <FieldLibrary onFieldSelect={handleFieldAdd} />
        <FormCanvas
          fields={fields}
          selectedFieldId={selectedFieldId}
          onFieldAdd={handleFieldAdd}
          onFieldSelect={handleFieldSelect}
          onFieldReorder={handleFieldReorder}
          onFieldDelete={handleFieldDelete}
        />
        <FieldConfigPanel
          field={selectedField}
          allFields={fields}
          onFieldUpdate={handleFieldUpdate}
          onClose={() => setSelectedFieldId(null)}
        />
      </div>

      {/* Create with AI modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !aiLoading && setShowAiModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <BiBot className="w-6 h-6 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-800">Create form with AI</h2>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Describe the form you want. For example: &quot;Contact form with name, email and message&quot; or &quot;Event registration with name, email, phone and dietary preferences dropdown&quot;.
            </p>
            {fields.length > 0 && (
              <p className="text-sm text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 mb-3">
                Generating will replace the current {fields.length} field{fields.length !== 1 ? 's' : ''}.
              </p>
            )}
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. Contact form with name, email and message"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
              rows={4}
              disabled={aiLoading}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => !aiLoading && setShowAiModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={aiLoading}
                className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-50"
              >
                {aiLoading ? <BiLoaderAlt className="w-5 h-5 animate-spin" /> : <BiBot className="w-5 h-5" />}
                {aiLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

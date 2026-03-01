import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FormRenderer } from '../components/FormRenderer';
import { formsService } from '../services/FormsService';
import { localStorageService } from '../services/LocalStorageService';
import type { FormSchema, FormSubmission } from '../types';

export default function FormPreview() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load form schema from backend
  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) {
        setError('No form ID provided');
        setLoading(false);
        return;
      }

      try {
        const form = await formsService.getForm(formId);
        if (!form) {
          setError('Form not found');
        } else {
          setFormSchema(form);
        }
      } catch (err) {
        setError('Failed to load form from server');
        console.error('Error loading form:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  // Handle form submission
  const handleSubmit = (data: Record<string, any>) => {
    if (!formSchema) return;

    try {
      // Create submission object
      const submission: FormSubmission = {
        id: crypto.randomUUID(),
        formId: formSchema.id,
        data,
        submittedAt: new Date(),
        workflowId: formSchema.workflowId,
      };

      // Save to localStorage
      localStorageService.saveSubmission(submission);

      // Show success message
      setShowSuccess(true);

      // Hide success message and reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        // Reload the page to reset the form
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error('Error saving submission:', err);
      setError('Failed to save submission. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !formSchema) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          {/* <div className="text-red-600 text-5xl mb-4"></div> */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 font-light mb-4">{error || 'Form not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-slate-600 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors font-light hover:scale-95 cursor-pointer"
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Success message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="text-green-600 text-2xl mr-3">✓</div>
              <div>
                <h3 className="text-green-800 font-semibold">Success!</h3>
                <p className="text-green-700 text-sm">
                  Your form has been submitted successfully.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form renderer */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <FormRenderer
            formSchema={formSchema}
            mode="submit"
            onSubmit={handleSubmit}
          />
        </div>

        {/* Back button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-700 text-sm"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
}

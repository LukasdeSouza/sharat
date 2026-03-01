import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { localStorageService } from '../services/LocalStorageService';
import type { FormSubmission, FormSchema, WorkflowDefinition } from '../types';
import { BiDownload, BiSearch, BiX } from 'react-icons/bi';
import { PiEmpty } from 'react-icons/pi';

export default function Submissions() {
  const [searchParams] = useSearchParams();
  const formIdParam = searchParams.get('formId');

  const [forms, setForms] = useState<FormSchema[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>(formIdParam || '');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [workflows, setWorkflows] = useState<Map<string, WorkflowDefinition>>(new Map());

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    // Load all forms
    const loadedForms = localStorageService.getAllForms();
    setForms(loadedForms);

    // Load all workflows
    const loadedWorkflows = localStorageService.getAllWorkflows();
    const workflowMap = new Map<string, WorkflowDefinition>();
    loadedWorkflows.forEach(workflow => {
      workflowMap.set(workflow.id, workflow);
    });
    setWorkflows(workflowMap);

    // If formId is in URL, select it
    if (formIdParam && loadedForms.some(f => f.id === formIdParam)) {
      setSelectedFormId(formIdParam);
    } else if (loadedForms.length > 0) {
      setSelectedFormId(loadedForms[0].id);
    }
  }, [formIdParam]);

  useEffect(() => {
    if (selectedFormId) {
      const loadedSubmissions = localStorageService.getSubmissionsByFormId(selectedFormId);
      setSubmissions(loadedSubmissions);
    } else {
      setSubmissions([]);
    }
  }, [selectedFormId]);

  // Filter submissions based on search query and date range
  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    // Filter by search query (searches across all field values)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(submission => {
        // Search in all field values
        const fieldValues = Object.values(submission.data).map(val => {
          if (Array.isArray(val)) {
            return val.join(' ');
          }
          return String(val || '');
        }).join(' ').toLowerCase();

        // Also search in submitter
        const submitter = (submission.submittedBy || '').toLowerCase();

        return fieldValues.includes(query) || submitter.includes(query);
      });
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(submission => submission.submittedAt >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(submission => submission.submittedAt <= end);
    }

    return filtered;
  }, [submissions, searchQuery, startDate, endDate]);

  const selectedForm = forms.find(f => f.id === selectedFormId);

  const handleExportSubmissions = () => {
    if (!selectedForm) return;

    // Prepare export data
    const exportData = {
      formName: selectedForm.name,
      formId: selectedForm.id,
      exportedAt: new Date().toISOString(),
      totalSubmissions: filteredSubmissions.length,
      submissions: filteredSubmissions.map(submission => ({
        id: submission.id,
        submittedAt: submission.submittedAt.toISOString(),
        submittedBy: submission.submittedBy,
        workflowId: submission.workflowId,
        workflowName: submission.workflowId ? workflows.get(submission.workflowId)?.name : null,
        data: submission.data
      }))
    };

    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedForm.name.replace(/\s+/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (forms.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-notion-text mb-8">Submissions</h1>
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-notion-bg-darker rounded-lg mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-notion-text-secondary">No forms found. Create a form first to view submissions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-notion-text mb-8">Submissions</h1>

        {/* Form Selector */}
        <div className="mb-8">
          <label htmlFor="form-select" className="block text-sm font-medium text-notion-text mb-2">
            Select Form
          </label>
          <select
            id="form-select"
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-notion-border rounded-lg focus:ring-2 focus:ring-notion-accent focus:border-transparent bg-white text-notion-text"
          >
            {forms.map(form => (
              <option key={form.id} value={form.id}>
                {form.name} ({localStorageService.getSubmissionsByFormId(form.id).length} submissions)
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        {selectedForm && submissions.length > 0 && (
          <div className="mb-8 bg-notion-bg-dark border border-notion-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-notion-text">Filters</h2>
              <button
                onClick={handleExportSubmissions}
                className="flex items-center gap-2 px-4 py-2 bg-notion-accent text-white rounded-lg hover:bg-notion-text transition-colors text-sm font-medium"
              >
                <BiDownload className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-notion-text mb-2">
                  Search
                </label>
                <div className="relative">
                  <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-text-tertiary" />
                  <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search submissions..."
                    className="w-full pl-10 pr-4 py-2 border border-notion-border rounded-lg focus:ring-2 focus:ring-notion-accent focus:border-transparent bg-white text-notion-text placeholder-notion-text-tertiary"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-notion-text mb-2">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-notion-border rounded-lg focus:ring-2 focus:ring-notion-accent focus:border-transparent bg-white text-notion-text"
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-notion-text mb-2">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-notion-border rounded-lg focus:ring-2 focus:ring-notion-accent focus:border-transparent bg-white text-notion-text"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || startDate || endDate) && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-notion-text bg-white border border-notion-border rounded-lg hover:bg-notion-bg-darker transition-colors"
                >
                  <BiX className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-4 text-sm text-notion-text-secondary">
              Showing {filteredSubmissions.length} of {submissions.length} submissions
            </div>
          </div>
        )}

        {/* Submissions Table */}
        {selectedForm && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg overflow-hidden">
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-notion-bg-darker rounded-lg mb-4">
                  <span className="text-xl">
                    <PiEmpty />
                  </span>
                </div>
                <p className="text-light text-slate-500">
                  {submissions.length === 0
                    ? 'No submissions yet for this form.'
                    : 'No submissions match the current filters.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-notion-border">
                  <thead className="bg-notion-bg-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-notion-text uppercase tracking-wider">
                        Submitted At
                      </th>
                      {selectedForm.fields.map(field => (
                        <th key={field.id} className="px-6 py-3 text-left text-xs font-semibold text-notion-text uppercase tracking-wider">
                          {field.label}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-notion-text uppercase tracking-wider">
                        Submitter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-notion-text uppercase tracking-wider">
                        Workflow
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-notion-border">
                    {filteredSubmissions.map(submission => {
                      const workflow = submission.workflowId ? workflows.get(submission.workflowId) : null;

                      return (
                        <tr key={submission.id} className="hover:bg-notion-bg-dark transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text">
                            {submission.submittedAt.toLocaleString()}
                          </td>
                          {selectedForm.fields.map(field => (
                            <td key={field.id} className="px-6 py-4 text-sm text-notion-text">
                              {formatFieldValue(submission.data[field.id], field.type)}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text-secondary">
                            {submission.submittedBy || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text-secondary">
                            {workflow ? workflow.name : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatFieldValue(value: any, fieldType: string): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (fieldType === 'date' && value) {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }

  return String(value);
}

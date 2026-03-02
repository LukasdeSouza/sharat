import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formsService } from '../services/FormsService';
import { workflowsService } from '../services/WorkflowsService';
import { submissionsService } from '../services/SubmissionsService';
import type { FormSubmission, FormSchema, WorkflowDefinition } from '../types';
import { BiDownload, BiSearch, BiX, BiLoaderAlt, BiGitBranch } from 'react-icons/bi';
import { PiEmpty } from 'react-icons/pi';
import { useToast, ToastContainer } from '../components/Toast';
import NotionAvatar from '../assets/notion-avatar.png'

export default function Submissions() {
  const [searchParams] = useSearchParams();
  const formIdParam = searchParams.get('formId');
  const toast = useToast();

  const [forms, setForms] = useState<FormSchema[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>(formIdParam || '');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [workflows, setWorkflows] = useState<Map<string, WorkflowDefinition>>(new Map());
  const [loading, setLoading] = useState(true);
  const [viewSubmission, setViewSubmission] = useState<any>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [loadedForms, loadedWorkflows] = await Promise.all([
          formsService.getAllForms(),
          workflowsService.getAllWorkflows()
        ]);

        setForms(loadedForms);

        const workflowMap = new Map<string, WorkflowDefinition>();
        loadedWorkflows.forEach(workflow => {
          workflowMap.set(workflow.id, workflow);
        });
        setWorkflows(workflowMap);

        // If formId is in URL, select it
        if (formIdParam && loadedForms.some(f => f.id === formIdParam)) {
          setSelectedFormId(formIdParam);
        } else if (loadedForms.length > 0 && !selectedFormId) {
          setSelectedFormId(loadedForms[0].id);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load forms data');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [formIdParam]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (selectedFormId) {
        try {
          setLoading(true);
          const data = await submissionsService.getSubmissions(selectedFormId);
          // Ensure dates are Date objects (backend sends strings)
          const parsedData = data.map((sub: any) => ({
            ...sub,
            submittedAt: new Date(sub.submittedAt || sub.createdAt)
          }));
          setSubmissions(parsedData);
        } catch (error) {
          console.error('Failed to load submissions:', error);
          toast.error('Failed to load submissions');
        } finally {
          setLoading(false);
        }
      } else {
        setSubmissions([]);
      }
    };
    fetchSubmissions();
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

  const handleViewSubmission = async (submission: FormSubmission) => {
    setViewSubmission(submission);
    try {
      const fullDetails = await submissionsService.getSubmission(submission.id);
      setViewSubmission({
        ...fullDetails,
        submittedAt: new Date(fullDetails.submittedAt ?? (fullDetails as { createdAt?: string }).createdAt ?? Date.now())
      });
    } catch (error) {
      console.error('Failed to load full submission details', error);
    }
  };

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

  const handleExportCSV = () => {
    if (!selectedForm) return;

    // Headers
    const headers = [
      'ID',
      'Submitted At',
      'Submitter',
      'Workflow',
      ...selectedForm.fields.map(f => f.label)
    ];

    // Rows
    const rows = filteredSubmissions.map(submission => {
      const workflowName = submission.workflowId ? workflows.get(submission.workflowId)?.name : '-';

      const fieldValues = selectedForm.fields.map(field => {
        const value = submission.data[field.id];
        return formatFieldValue(value, field.type);
      });

      const rowData = [
        submission.id,
        submission.submittedAt.toLocaleString(),
        submission.submittedBy || '-',
        workflowName || '-',
        ...fieldValues
      ];

      return rowData.map(cell => {
        const stringCell = String(cell);
        return `"${stringCell.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedForm.name.replace(/\s+/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && forms.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <BiLoaderAlt className="w-10 h-10 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-notion-text mb-8">Submissions</h1>
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-notion-bg-darker rounded-lg mb-6">
              {/* <span className="text-3xl">📝</span> */}
            </div>
            <p className="text-notion-text-secondary">No forms found. Create a form first to view submissions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer messages={toast.messages} onClose={toast.removeToast} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className='flex flex-row items-baseline gap-2'>
          <img src={NotionAvatar} alt="" width={50} />
          <h1 className="text-4xl sm:text-5xl font-bold text-notion-text mb-3 tracking-tight">
            Submissions
          </h1>
        </div>

        {/* Form Selector */}
        <div className="mb-8">
          <label htmlFor="form-select" className="block text-sm font-light text-slate-500 mb-2">
            Select a Form to see submisions
          </label>
          <select
            id="form-select"
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-notion-border rounded-lg focus:ring-2 focus:ring-notion-accent focus:border-transparent bg-white text-notion-text"
          >
            {forms.map(form => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        {selectedForm && (
          <div className="mb-8 bg-notion-bg-dark border border-slate-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-notion-text">Filters</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportSubmissions}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-notion-border text-notion-text rounded-lg hover:bg-notion-bg-dark transition-colors text-sm font-medium cursor-pointer hover:scale:95 hover:bg-slate-300"
                  title="Export as JSON"
                >
                  <BiDownload className="w-4 h-4" />
                  Download as JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-notion-text transition-colors text-sm font-medium cursor-pointer hover:scale:95"
                  title="Export as CSV"
                >
                  <BiDownload className="w-4 h-4" />
                  Download as CSV
                </button>
              </div>
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
                  className="flex items-center gap-2 px-4 py-2 text-sm text-notion-text bg-white border border-notion-border rounded-lg hover:bg-notion-bg-darker transition-colors hover:text-red-500 hover:border-red-500 hover:scale-95 cursor-pointer"
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
            {loading ? (
              <div className="p-12 flex justify-center">
                <BiLoaderAlt className="w-8 h-8 text-slate-400 animate-spin" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
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
                        <tr 
                          key={submission.id} 
                          className="hover:bg-notion-bg-dark transition-colors cursor-pointer"
                          onClick={() => handleViewSubmission(submission)}
                        >
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

        {/* Submission Details Modal */}
        {viewSubmission && selectedForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setViewSubmission(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-notion-text">Submission Details</h2>
                  <p className="text-xs text-notion-text-secondary mt-1 font-mono">
                    {viewSubmission.id}
                  </p>
                </div>
                <button 
                  onClick={() => setViewSubmission(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <BiX className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Submitter</p>
                    <p className="text-sm font-medium text-slate-700">{viewSubmission.submittedBy || 'Anonymous'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Date</p>
                    <p className="text-sm font-medium text-slate-700">
                      {viewSubmission.submittedAt instanceof Date 
                        ? viewSubmission.submittedAt.toLocaleString() 
                        : new Date(viewSubmission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Workflow Info */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-notion-text mb-3 flex items-center gap-2">
                    <BiGitBranch className="text-slate-400"/>
                    Workflow Status
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        viewSubmission.workflowStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                        viewSubmission.workflowStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                        viewSubmission.workflowStatus === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}>
                        {viewSubmission.workflowStatus || 'PENDING'}
                      </div>
                      {viewSubmission.workflowId && (
                        <span className="text-sm text-slate-600 font-medium">
                          {workflows.get(viewSubmission.workflowId)?.name || 'Unknown Workflow'}
                        </span>
                      )}
                  </div>
                </div>

                {/* Form Data */}
                <div>
                  <h3 className="text-sm font-bold text-notion-text mb-4 border-b border-slate-100 pb-2">Form Data</h3>
                  <div className="space-y-4">
                    {selectedForm.fields.map(field => (
                      <div key={field.id} className="group">
                        <p className="text-xs font-medium text-slate-500 mb-1">{field.label}</p>
                        <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                          {formatFieldValue(viewSubmission.data[field.id], field.type)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Log Section */}
                {viewSubmission.auditLogs && viewSubmission.auditLogs.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-notion-text mb-3 border-b border-slate-100 pb-2">Activity Log</h3>
                    <div className="space-y-3">
                      {viewSubmission.auditLogs.map((log: any) => (
                        <div key={log.id} className="flex gap-3 text-sm">
                          <div className="text-slate-400 text-xs min-w-[120px] pt-0.5">
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">{log.action}</span>
                            <span className="text-slate-300 mx-2">|</span>
                            <span className="text-slate-600">{log.details}</span>
                            {log.user && (
                              <span className="text-slate-400 text-xs ml-2 block sm:inline sm:ml-2">
                                by {log.user.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
                 <button
                    onClick={() => setViewSubmission(null)}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm"
                  >
                    Close
                  </button>
              </div>
            </div>
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

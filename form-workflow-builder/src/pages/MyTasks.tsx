import { useState, useEffect } from 'react';
import { submissionsService, type FormSubmission } from '../services/SubmissionsService';
import { BiCheckCircle, BiXCircle, BiTime, BiDetail, BiLoaderAlt, BiX } from 'react-icons/bi';
import { useToast, ToastContainer } from '../components/Toast';
import NotionAvatar from '../assets/notion-avatar.png';

export default function MyTasks() {
  const [tasks, setTasks] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<FormSubmission | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await submissionsService.getMyTasks();
      // Ensure dates are Date objects
      const parsedData = data.map((sub: any) => ({
        ...sub,
        submittedAt: new Date(sub.submittedAt || sub.createdAt)
      }));
      setTasks(parsedData);
    } catch (error) {
      console.error('Failed to load tasks', error);
      toast.error('Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setProcessingId(id);
      await submissionsService.updateSubmissionStatus(id, status);
      toast.success(`Submission ${status.toLowerCase()} successfully`);
      setSelectedTask(null);
      loadTasks(); // Reload list
    } catch (error) {
      console.error('Action failed', error);
      toast.error('Failed to update submission status');
    } finally {
      setProcessingId(null);
    }
  };

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <BiLoaderAlt className="w-10 h-10 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer messages={toast.messages} onClose={toast.removeToast} />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className='flex flex-row items-baseline gap-2 mb-8'>
          <img src={NotionAvatar} alt="" width={40} />
          <h1 className="text-3xl font-bold text-notion-text tracking-tight">
            My Tasks
          </h1>
          <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
            {tasks.length} Pending
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-sm">
              <BiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">All caught up!</h2>
            <p className="text-slate-500">You have no pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task: any) => (
              <div 
                key={task.id} 
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {task.form?.name || 'Unknown Form'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <BiTime /> {task.submittedAt.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                      Submission from {task.submittedBy || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {Object.values(task.data).slice(0, 3).join(' • ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task Details Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setSelectedTask(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Review Submission</h2>
                  <p className="text-sm text-slate-500">{(selectedTask as any).form?.name}</p>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <BiX className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                <div className="space-y-6">
                  {/* Meta Data */}
                  <div className="flex gap-4 text-sm text-slate-500 bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Submitter</span>
                      <span className="font-medium text-slate-800">{selectedTask.submittedBy || 'Anonymous'}</span>
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Date</span>
                      <span className="font-medium text-slate-800">{selectedTask.submittedAt.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <BiDetail /> Form Data
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {(selectedTask as any).form?.schema?.fields?.map((field: any) => (
                        <div key={field.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">{field.label}</p>
                          <div className="text-sm text-slate-800 whitespace-pre-wrap">
                            {formatFieldValue(selectedTask.data[field.id])}
                          </div>
                        </div>
                      )) || (
                        // Fallback if schema is not joined properly (though backend route includes it)
                        Object.entries(selectedTask.data).map(([key, value]) => (
                          <div key={key} className="p-4">
                            <p className="text-xs font-medium text-slate-500 mb-1 uppercase">{key}</p>
                            <div className="text-sm text-slate-800">{formatFieldValue(value)}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Actions) */}
              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={!!processingId}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(selectedTask.id, 'REJECTED')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                  disabled={!!processingId}
                >
                  {processingId === selectedTask.id ? <BiLoaderAlt className="animate-spin"/> : <BiXCircle />}
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selectedTask.id, 'APPROVED')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm hover:shadow"
                  disabled={!!processingId}
                >
                  {processingId === selectedTask.id ? <BiLoaderAlt className="animate-spin"/> : <BiCheckCircle />}
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

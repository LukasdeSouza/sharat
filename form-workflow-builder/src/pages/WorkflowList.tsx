import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FormSchema } from '../types';
import { workflowsService } from '../services/WorkflowsService';
import { formsService } from '../services/FormsService';
import { authService } from '../services/AuthService';
import { BiTrash, BiPlus, BiEdit, BiSearch, BiFilterAlt, BiGitBranch, BiChevronLeft, BiBox } from 'react-icons/bi';
import { useToast, ToastContainer } from '../components/Toast';
import { MdBlurCircular } from 'react-icons/md';

interface WorkflowListItem {
  id: string;
  name: string;
  formId: string;
  formName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function WorkflowList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormId, setSelectedFormId] = useState<'all' | string>('all');
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const loadUser = async () => {
      let user = await authService.getCurrentUser();
      if (!user) {
        const stored = localStorage.getItem('user');
        if (stored) {
          try { user = JSON.parse(stored); } catch (e) {}
        }
      }
      if (user) setUserRole(user.role);
    };
    loadUser();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allForms, allWorkflows] = await Promise.all([
        formsService.getAllForms(),
        workflowsService.getAllWorkflows()
      ]);

      setForms(allForms);

      // Link forms names to workflows
      const formMap = new Map(allForms.map(f => [f.id, f.name]));
      const mappedWorkflows = allWorkflows.map(w => ({
        ...w,
        formName: formMap.get(w.formId) || 'Deleted Form'
      }));

      setWorkflows(mappedWorkflows);
    } catch (err) {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      try {
        await workflowsService.deleteWorkflow(id);
        toast.success('Workflow deleted successfully');
        loadData();
      } catch (err) {
        toast.error('Failed to delete workflow');
      }
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.formName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesForm = selectedFormId === 'all' || w.formId === selectedFormId;
    return matchesSearch && matchesForm;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <MdBlurCircular className="w-12 h-12 text-slate-200 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer messages={toast.messages} onClose={toast.removeToast} />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium mb-2"
              >
                <BiChevronLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className='flex flex-row items-baseline gap-2'>
                <BiGitBranch className="text-slate-400" size={35}/>
                <h1 className="text-4xl sm:text-5xl font-bold text-notion-text mb-3 tracking-tight">
                  Workflow Strategies
                </h1>
              </div>
              <p className="text-lg text-slate-500 max-w-2xl font-light  leading-relaxed">Design, automate, and monitor your process workflows.</p>
            </div>
            {(userRole === 'ADMIN' || userRole === 'admin') && (
              <button
                onClick={() => navigate('/workflows/designer')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all font-medium shadow-lg active:scale-95 hover:scale-95"
              >
                <BiPlus className="w-5 h-5" />
                New Workflow
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by workflow name or form..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <BiFilterAlt className="text-slate-400 w-5 h-5" />
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none transition-all font-medium text-slate-600"
            >
              <option value="all">Every Connected Form</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {filteredWorkflows.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-20 text-center">
            <div className="text-slate-300 mb-4 flex justify-center">
              <BiBox className="w-16 h-16" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No workflows found</h3>
            <p className="text-slate-500 mt-1">Try building a new strategy or refining your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="group bg-white border border-slate-200 rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:border-slate-300 relative overflow-hidden hover:scale-95"
              >
                {/* Visual accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-10 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-600">
                    <BiGitBranch className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                    Automation Active
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-black transition-colors truncate">
                  {workflow.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-sm font-medium">
                  <BiBox className="w-3.5 h-3.5" />
                  <span>Linked to: <span className="text-slate-800 underline decoration-slate-200">{workflow.formName}</span></span>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Last Update</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {new Date(workflow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(userRole === 'ADMIN' || userRole === 'admin') && (
                      <>
                        <button
                          onClick={() => navigate(`/workflows/designer?id=${workflow.id}&formId=${workflow.formId}`)}
                          className="p-2 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit Strategy"
                        >
                          <BiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <BiTrash className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

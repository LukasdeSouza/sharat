import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FormSchema, WorkflowDefinition } from '../types';
import { formsService } from '../services/FormsService';
import { workflowsService } from '../services/WorkflowsService';
import { statsService, type TenantStats } from '../services/StatsService';
import { BiTrash, BiGitBranch, BiPlus, BiEdit, BiCheckDouble, BiShareAlt, BiGlobe, BiLockAlt, BiUser, BiSpreadsheet, BiGitMerge } from 'react-icons/bi';
import { BsEye, BsInbox } from 'react-icons/bs';
import NotionAvatar from '../assets/notion-avatar.png';
import { PiEmpty } from 'react-icons/pi';
import { MdBlurCircular } from 'react-icons/md';
import { useToast, ToastContainer } from '../components/Toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const STATS_DAYS = 14;

function fillSubmissionsByDay(data: { date: string; count: number }[], days: number): { date: string; count: number }[] {
  const byDate = new Map(data.map((d) => [d.date, d.count]));
  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  return result;
}

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [workflows, setWorkflows] = useState<Map<string, WorkflowDefinition>>(new Map());
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [hoveredFormId, setHoveredFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const chartData = useMemo(
    () => (stats ? fillSubmissionsByDay(stats.submissionsByDay, STATS_DAYS) : []),
    [stats]
  );

  useEffect(() => {
    loadForms();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsService.getStats(STATS_DAYS);
      setStats(data);
    } catch {
      setStats(null);
    }
  };

  const loadForms = async () => {
    try {
      setLoading(true);
      const allForms = await formsService.getAllForms();
      setForms(allForms);

      const workflowMap = new Map<string, WorkflowDefinition>();
      for (const form of allForms) {
        try {
          const workflows = await workflowsService.getWorkflowsByForm(form.id);
          if (workflows.length > 0) {
            workflowMap.set(form.id, workflows[0]);
          }
        } catch (err) { }
      }
      setWorkflows(workflowMap);
      await loadStats();
    } catch (err) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      try {
        await formsService.deleteForm(formId);
        toast.success('Form deleted');
        loadForms();
      } catch (err) {
        toast.error('Failed to delete form');
      }
    }
  };

  const handleShare = (form: FormSchema) => {
    if (!form.isPublished) {
      toast.info('Publish the form first to share it publicly.');
      return;
    }

    // Check if form has a workflow (from our loaded map)
    if (!workflows.has(form.id)) {
      toast.warning('This form must have an associated workflow before it can be shared.');
      return;
    }

    const url = `${window.location.origin}/f/${form.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Public link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <MdBlurCircular className="w-12 h-12 text-slate-200 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer messages={toast.messages} onClose={toast.removeToast} />

      {/* Hero Section */}
      <div className="border-b border-notion-border">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className='flex flex-row items-baseline gap-2'>
                <img src={NotionAvatar} alt="" width={50} />
                <h1 className="text-4xl sm:text-5xl font-bold text-notion-text mb-3 tracking-tight">
                  Forms & Workflows
                </h1>
              </div>
              <p className="text-lg text-slate-500 max-w-2xl font-light  leading-relaxed">
                Create beautiful forms and design powerful workflows.
              </p>
            </div>
            <button
              onClick={() => navigate('/forms/builder')}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer font-medium shadow-sm active:scale-95"
            >
              <BiPlus className="w-5 h-5" />
              New Form
            </button>
          </div>
        </div>
      </div>

      {/* Account Overview */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Account overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:scale-95 transition-all ease-in-out">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-200 rounded-lg text-slate-800">
                <BsInbox className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats?.submissions ?? '—'}</p>
                <p className="text-sm text-slate-500 font-medium">Submissions</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:scale-95 transition-all ease-in-out">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-200 rounded-lg text-slate-800">
                <BiUser className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats?.users ?? '—'}</p>
                <p className="text-sm text-slate-500 font-medium">Users</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:scale-95 transition-all ease-in-out">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-200 rounded-lg text-slate-800">
                <BiSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats?.forms ?? '—'}</p>
                <p className="text-sm text-slate-500 font-medium">Forms</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:scale-95 transition-all ease-in-out">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-200 rounded-lg text-slate-800">
                <BiGitMerge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats?.workflows ?? '—'}</p>
                <p className="text-sm text-slate-500 font-medium">Workflows</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Submissions in the last {STATS_DAYS} days</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#fff' }}
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={2} fill="url(#colorSubmissions)" name="Submissions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Submissions by form</h3>
            <div className="h-[240px]">
              {stats?.submissionsByForm && stats.submissionsByForm.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.submissionsByForm}
                    layout="vertical"
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      type="category"
                      dataKey="formName"
                      width={120}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(v) => (v.length > 18 ? v.slice(0, 18) + '…' : v)}
                    />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#fff' }} />
                    <Bar dataKey="count" fill="#0f172a" radius={[0, 4, 4, 0]} name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No submissions per form yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {forms.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-notion-bg-darker rounded-lg mb-6 text-slate-400">
              <PiEmpty className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No forms yet</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Get started by creating your first form.
            </p>
            <button
              onClick={() => navigate('/forms/builder')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer font-medium shadow-sm active:scale-95"
            >
              Create First Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => {
              const workflow = workflows.get(form.id);
              const isHovered = hoveredFormId === form.id;

              return (
                <div
                  key={form.id}
                  onMouseEnter={() => setHoveredFormId(form.id)}
                  onMouseLeave={() => setHoveredFormId(null)}
                  className="group relative bg-white border border-slate-200 rounded-xl p-6 transition-all cursor-pointer duration-200 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {form.isPublished ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold tracking-wider uppercase border border-green-100">
                        <BiGlobe className="w-3 h-3" />
                        Published
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-100">
                        <BiLockAlt className="w-3 h-3" />
                        Draft
                      </div>
                    )}
                  </div>

                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors truncate pr-16">
                      {form.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">
                      {form.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-6 py-3 border-y border-slate-50">
                    <div className="flex items-center gap-1">
                      <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    </div>
                    {workflow && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <BiGitBranch className="w-3 h-3" />
                        <span>Active Workflow</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/forms/builder?id=${form.id}`)}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <BiEdit className="w-4 h-4" />
                      {/* Edit */}
                    </button>
                    <button
                      onClick={() => handleShare(form)}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <BiShareAlt className="w-4 h-4" />
                      {/* Share */}
                    </button>
                    <button
                      onClick={() => navigate(`/preview/${form.id}`)}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <BsEye className="w-4 h-4" />
                      {/* Preview */}
                    </button>
                    <button
                      onClick={() => navigate(`/submissions?formId=${form.id}`)}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <BiCheckDouble className="w-4 h-4" />
                      Submissions
                    </button>
                  </div>

                  {/* Delete Button */}
                  {isHovered && (
                    <button
                      onClick={() => handleDeleteForm(form.id)}
                      className="absolute -top-2 -right-2 p-2 bg-white text-slate-300 hover:text-red-500 rounded-full shadow-lg border border-slate-100 transition-all cursor-pointer hover:scale-110"
                    >
                      <BiTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

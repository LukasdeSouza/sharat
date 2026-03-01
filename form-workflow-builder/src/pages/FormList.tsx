import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FormSchema } from '../types';
import { formsService } from '../services/FormsService';
import { BiTrash, BiPlus, BiEdit, BiSearch, BiFilterAlt, BiGlobe, BiLockAlt, BiChevronLeft, BiFile } from 'react-icons/bi';
import { BsEye } from 'react-icons/bs';
import { useToast, ToastContainer } from '../components/Toast';
import { MdBlurCircular } from 'react-icons/md';

export default function FormList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const allForms = await formsService.getAllForms();
      setForms(allForms);
    } catch (err) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        await formsService.deleteForm(formId);
        toast.success('Form deleted successfully');
        loadForms();
      } catch (err) {
        toast.error('Failed to delete form');
      }
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesFilter = filter === 'all' ||
      (filter === 'published' && form.isPublished) ||
      (filter === 'draft' && !form.isPublished);
    return matchesSearch && matchesFilter;
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
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <BiFile className="text-slate-400" />
                Form Management
              </h1>
              <p className="text-slate-500 mt-2">Manage, edit, and organize your company forms.</p>
            </div>
            <button
              onClick={() => navigate('/forms/builder')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all font-medium shadow-lg active:scale-95 hover:scale-95 cursor-pointer"
            >
              <BiPlus className="w-5 h-5" />
              Create Form
            </button>
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
              placeholder="Search forms by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <BiFilterAlt className="text-slate-400 w-5 h-5" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none transition-all font-medium text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {filteredForms.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-20 text-center">
            <div className="text-slate-300 mb-4 flex justify-center">
              <BiFile className="w-16 h-16" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No forms found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="group bg-white border border-slate-200 rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:border-slate-300 relative overflow-hidden hover:scale-95"
              >
                {/* Status bar */}
                <div className={`absolute top-0 left-0 w-full h-1 ${form.isPublished ? 'bg-green-500' : 'bg-slate-300'}`} />

                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${form.isPublished ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                    <BiFile className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {form.isPublished ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                        <BiGlobe className="w-3 h-3" /> Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                        <BiLockAlt className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-black transition-colors truncate">
                  {form.name}
                </h3>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2 h-10">
                  {form.description || 'No description provided.'}
                </p>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Created {new Date(form.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/preview/${form.id}`)}
                      className="p-2 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition-all"
                      title="Preview"
                    >
                      <BsEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/forms/builder?id=${form.id}`)}
                      className="p-2 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition-all"
                      title="Edit"
                    >
                      <BiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <BiTrash className="w-4 h-4" />
                    </button>
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

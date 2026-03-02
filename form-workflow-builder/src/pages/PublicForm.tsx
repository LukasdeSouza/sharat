import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formsService } from '../services/FormsService';
import { FormRenderer } from '../components/FormRenderer';
import type { FormSchema } from '../types';
import { BiLoaderAlt, BiCheckCircle } from 'react-icons/bi';
import AvatarNotion from '../assets/avatartion.png'

export default function PublicForm() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await formsService.getPublicForm(id);
        setForm(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Form not found or inaccessible');
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [id]);

  const handleSubmit = async (data: Record<string, any>) => {
    if (!id) return;
    try {
      await formsService.submitPublicForm(id, data);
      setSubmitted(true);
    } catch (err: any) {
      setError('Failed to submit form. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <BiLoaderAlt className="w-10 h-10 text-slate-400 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading form...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Oops!</h1>
          <p className="text-slate-600 mb-6">{error || 'Something went wrong.'}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <BiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Thank you!</h1>
          <p className="text-slate-600">Your response has been submitted successfully.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
          >
            create my own form
          </button>
        </div>
      </div>
    );
  }

  // Apply styling if present
  const styling = form.styling || {
    primaryColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div
      className="min-h-screen overflow-y-auto flex flex-col items-center py-12 px-4 shadow-inner"
      style={{
        backgroundColor: styling.backgroundColor,
        fontFamily: styling.fontFamily
      }}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <img src={AvatarNotion} alt="" />
        {/* Header stripe with primary color */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: styling.primaryColor }}
        />

        <div className="p-8 md:p-12">
          <FormRenderer
            formSchema={form}
            mode="submit"
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <div className="flex flex-col items-center mt-8 text-center text-slate-400 text-xs gap-2">
        <span>Powered by</span>
        <span className="font-bold tracking-tight text-slate-500 text-lg">Form Builder PRO</span>
        <button className='bg-black text-white font-light p-3 rounded-md hover:scale-95 transition-all ease-in-out delay-75 cursor-pointer'>create my own form for FREE</button>
      </div>
    </div>
  );
}

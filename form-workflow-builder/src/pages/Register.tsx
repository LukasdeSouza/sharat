import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { BiUserPlus, BiArrowToRight, BiArrowToLeft } from 'react-icons/bi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = () => {
    setError(null);
    if (step === 0) {
      if (!companyName.trim()) {
        setError('Please enter your company name');
        return;
      }
    }
    if (step === 1) {
      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
    }
    if (step === 2) {
      if (!password) {
        setError('Please enter a password');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      // Last step: submit
      handleSubmit();
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      setLoading(true);
      const response = await authService.register(companyName, email, password);
      authService.setToken(response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goNext();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg mb-4">
            <BiUserPlus className="w-6 h-6 text-slate-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h1>
          <p className="text-slate-500">Get started with Form Workflow Builder</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-slate-800 w-8' : 'bg-slate-200 w-6'
              }`}
            />
          ))}
        </div>

        {/* Form container with overflow for slide */}
        <div className="w-full overflow-hidden">
          <form
            onSubmit={(e) => { e.preventDefault(); goNext(); }}
            className="relative w-full"
          >
            {error && (
              <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm">
                {error}
              </div>
            )}

            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ width: '300%', transform: `translateX(-${step * (100 / 3)}%)` }}
            >
              {/* Step 0: Company Name */}
              <div className="shrink-0 px-1" style={{ width: '33.333%' }}>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                  Company name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Your Company"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Step 1: Email */}
              <div className="shrink-0 px-1" style={{ width: '33.333%' }}>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Step 2: Password + Confirm (together) */}
              <div className="shrink-0 px-1 space-y-4" style={{ width: '33.333%' }}>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  <BiArrowToLeft className="w-5 h-5" />
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Creating account...'
                ) : step === 2 ? (
                  'Create account'
                ) : (
                  <>
                    Next
                    <BiArrowToRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-sm text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-slate-800 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

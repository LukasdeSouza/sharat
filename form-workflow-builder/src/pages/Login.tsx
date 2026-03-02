import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';
import NotionAvatar from '../assets/notion-avatar.png'

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(email, password);
      authService.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-notion-bg-darker rounded-lg mb-4">
            <img src={NotionAvatar} width={200}/>
            {/* <BiLogIn className="w-6 h-6 text-notion-accent" /> */}
          </div>
          <h1 className="text-3xl font-bold text-notion-text mb-2">Welcome Back</h1>
          <p className="text-notion-text-secondary">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-yellow-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-notion-text mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-notion-border rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent transition-colors"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-notion-text mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-notion-border rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent transition-colors"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-95 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-notion-border"></div>
          <span className="text-sm text-notion-text-tertiary">or</span>
          <div className="flex-1 h-px bg-notion-border"></div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-notion-text-secondary text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-notion-accent hover:text-notion-text font-medium transition-colors cursor-pointer hover:scale-95 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-notion-bg-darker rounded-lg border border-notion-border">
          <p className="text-xs font-medium text-notion-text-secondary mb-2">Demo Credentials:</p>
          <p className="text-xs text-notion-text-tertiary">
            Email: <span className="font-mono">admin@test.com</span>
          </p>
          <p className="text-xs text-notion-text-tertiary">
            Password: <span className="font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
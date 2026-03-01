import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BiHome, BiFile, BiGitBranch, BiCheckDouble, BiLogOut, BiUser, BiGroup } from 'react-icons/bi';
import { useState, useEffect } from 'react';
import { authService } from '../services/AuthService';
import NotionAvatar from '../assets/notion-avatar.png'
import { Dialog } from './Dialog';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      let user = await authService.getCurrentUser();

      // Fallback: Tenta pegar do localStorage se o service não retornar nada
      if (!user) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            user = JSON.parse(storedUser);
          } catch (e) { /* ignore error */ }
        }
      }

      if (user) {
        setUserEmail(user.email);
        setUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: BiHome, path: '/' },
    { name: 'Forms', icon: BiFile, path: '/forms' },
    { name: 'Workflows', icon: BiGitBranch, path: '/workflows' },
    { name: 'Submissions', icon: BiCheckDouble, path: '/submissions' },
  ];

  // Only show Team management for Admins
  if (userRole === 'admin' || userRole === 'ADMIN') {
    navItems.push({ name: 'Team & Access', icon: BiGroup, path: '/users' });
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    authService.logout();
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 z-50 bg-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-notion-accent rounded-lg flex items-center justify-center group-hover:bg-notion-text transition-colors">
                <img src={NotionAvatar} alt="" />
                {/* <span className="text-white font-bold text-sm">FB</span> */}
              </div>
              <div className='flex flex-row items-baseline gap-1'>
                <span className="text-lg font-semibold text-notion-text hidden sm:inline">Form </span>
                <span className="text-sm font-light text-notion-text hidden sm:inline">builder </span>

              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:scale-90 transition-all duration-200 ${active
                      ? 'bg-notion-bg-darker text-notion-text'
                      : 'text-notion-text-secondary hover:bg-notion-bg-dark hover:text-notion-text'
                      }`}
                  >
                    {/* <Icon className="w-4 h-4" /> */}
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            {userEmail && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-notion-text-secondary hover:bg-notion-bg-dark hover:text-notion-text transition-colors"
                >
                  <BiUser className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs truncate max-w-[120px]">{userEmail}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-notion-border rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-notion-border">
                      <p className="text-xs text-notion-text-secondary">Logged in as</p>
                      <p className="text-sm font-medium text-notion-text truncate">{userEmail}</p>
                    </div>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <BiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 text-notion-text-tertiary text-xs py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>© 2026 Form Workflow Builder. Built with React & TypeScript.</p>
        </div>
      </footer>

      <Dialog
        isOpen={showLogoutDialog}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Confirm and Logout"
        isDangerous={true}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </div>
  );
}

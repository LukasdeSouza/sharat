import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BiHome, BiFile, BiGitBranch, BiCheckDouble, BiLogOut, BiUser, BiGroup, BiBell, BiTask } from 'react-icons/bi';
import { useState, useEffect, useRef } from 'react';
import { authService } from '../services/AuthService';
// import { notificationsService } from '../services/NotificationsService';
import NotionAvatar from '../assets/notion-avatar.png'
import { Dialog } from './Dialog';
import { notificationsService } from '../services/NotificationsService';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [pendingApprovalNotification, setPendingApprovalNotification] = useState<any>(null);
  const lastNotificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      let user = await authService.getCurrentUser();

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

  useEffect(() => {
    if (userEmail) {
      loadNotifications();
      // Poll for notifications every 30 seconds (simulating socket)
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Form Builder PRO`;
    } else {
      document.title = 'Form Builder PRO';
    }
  }, [unreadCount]);

  const loadNotifications = async () => {
    try {
      const data = await notificationsService.getNotifications();
      
      if (data.length > 0) {
        const latestId = data[0].id;
        // Check if we have a previous ID and it's different from the new one (meaning a new notification arrived)
        if (lastNotificationIdRef.current && latestId !== lastNotificationIdRef.current) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.error("Audio play failed", e));

          if (data[0].title.includes('Approval') && !data[0].read) {
            setPendingApprovalNotification(data[0]);
            setShowApprovalDialog(true);
          }
        }
        lastNotificationIdRef.current = latestId;
      }

      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await notificationsService.markAsRead(notification.id);
      loadNotifications();
    }
    setShowNotifications(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: BiHome, path: '/' },
    { name: 'Forms', icon: BiFile, path: '/forms' },
    { name: 'Workflows', icon: BiGitBranch, path: '/workflows' },
    { name: 'My Tasks', icon: BiTask, path: '/my-tasks' },
    { name: 'Submissions', icon: BiCheckDouble, path: '/submissions' },
    // { name: 'Team', icon: BiCheckDouble, path: '/users' },
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
    setShowLogoutDialog(false)
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleApprovalConfirm = async () => {
    setShowApprovalDialog(false);
    if (pendingApprovalNotification) {
      if (pendingApprovalNotification.link) {
        navigate(pendingApprovalNotification.link);
      }
      await notificationsService.markAsRead(pendingApprovalNotification.id);
      loadNotifications();
    }
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
                <span className="text-sm font-light text-notion-text hidden sm:inline">builder pro </span>

              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                // const Icon = item.icon;
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

            <div className='flex flex-row items-center gap-1'>
              {/* Notifications */}
              {userEmail && (
                <div className="relative ml-auto mr-2">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-notion-text-secondary hover:bg-notion-bg-dark hover:text-notion-text transition-colors bg-slate-200 rounded-full cursor-pointer hover:scale-105"
                  >
                    <BiBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-notion-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-notion-border flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-notion-text">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={async () => { await notificationsService.markAllAsRead(); loadNotifications(); }} className="text-xs text-notion-accent hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-notion-text-tertiary">No notifications</div>
                      ) : (
                        <div className="divide-y divide-notion-border">
                          {notifications.map((notification) => (
                            <div key={notification.id} onClick={() => handleNotificationClick(notification)} className={`p-3 hover:bg-notion-bg-dark cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                              <p className="text-sm text-notion-text font-medium">{notification.title}</p>
                              <p className="text-xs text-notion-text-secondary mt-1">{notification.message}</p>
                              <p className="text-[10px] text-notion-text-tertiary mt-2">{new Date(notification.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* User Menu */}
              {userEmail && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-notion-text-secondary hover:bg-notion-bg-dark hover:text-notion-text transition-colors"
                  >
                    <BiUser className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs truncate max-w-30">{userEmail}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-100 border border-slate-500 rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-slate-500">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 text-notion-text-tertiary text-xs py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>© 2026 Form Builder PRO.</p>
          <span>created by Lucas de Souza Silva</span>
          <br />
          <span>all rights reserved</span>
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

      <Dialog
        isOpen={showApprovalDialog}
        title="Action Required"
        message={pendingApprovalNotification?.message || "You have a new approval request."}
        confirmText="View Request"
        isDangerous={false}
        onConfirm={handleApprovalConfirm}
        onCancel={() => setShowApprovalDialog(false)}
      />
    </div>
  );
}

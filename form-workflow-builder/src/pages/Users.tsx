import { useEffect, useState } from 'react';
import { usersService } from '../services/UsersService';
import type { User, Role } from '../types';
import { authService } from '../services/AuthService';
import { BiTrash, BiUserPlus, BiGroup, BiShield } from 'react-icons/bi';
// import { useNavigate } from 'react-router-dom';
// import NotionNoPermission from '../assets/avatartion_2.png'

export default function Users() {
  // const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role | string>('VIEWER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      let user = await authService.getCurrentUser();

      if (!user) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            user = JSON.parse(storedUser);
          } catch (e) { /* ignore */ }
        }
      }
      setCurrentUser(user);

      if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
        // setError('Access denied. Admin only.');
        setLoading(false);
        return;
      }

      loadUsers();
    } catch (err) {
      // setError('Failed to load user info');
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (err: any) {
      // setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    try {
      setIsSubmitting(true);
      await usersService.createUser({
        email: newEmail,
        password: newPassword,
        role: newRole as Role,
      });

      // Reset form
      setNewEmail('');
      setNewPassword('');
      setNewRole('VIEWER');
      setShowAddForm(false);

      // Reload list
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete yourself.");
      return;
    }

    if (confirm('Are you sure you want to remove this user from the company?')) {
      try {
        await usersService.deleteUser(userId);
        loadUsers();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-notion-bg-darker rounded-lg mb-4">
            <span className="text-2xl animate-spin">⏳</span>
          </div>
          <p className="text-notion-text-secondary">Loading team data...</p>
        </div>
      </div>
    );
  }

  // if (error && !users.length) {
  //   return (
  //     <div className="max-w-7xl mx-auto px-6 py-12">
  //       <div className="flex flex-col items-center  gap-4 bg-white border border-slate-200 rounded-lg p-8 text-center">
  //         <img src={NotionNoPermission} alt="" width={100} />
  //         <h1 className="text-slate-800 font-semibold text-xl2 mb-2">Sorry, friend.</h1>
  //         <div className='flex flex-col items-center'>
  //           <p className="text-slate-600 font-light">{error}</p>
  //           <span className='text-light text-slate-500'>you don't have enough permissions for it.</span>
  //         </div>
  //         <button
  //           onClick={() => navigate('/')}
  //           className="px-4 py-2 bg-slate-600 text-white font-light rounded-lg hover:bg-slate-700 transition-colors"
  //         >
  //           Return
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-notion-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-notion-bg-darker rounded-lg">
                  <BiGroup className="w-6 h-6 text-notion-accent" />
                </div>
                <h1 className="text-4xl font-bold text-notion-text tracking-tight">Team Management</h1>
              </div>
              <p className="text-lg text-slate-500 font-light max-w-2xl leading-relaxed">
                Manage your company's users and their access levels.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-all font-medium"
            >
              <BiUserPlus className="w-5 h-5" />
              {showAddForm ? 'Cancel' : 'Add User'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add User Form */}
        {showAddForm && (
          <div className="mb-10 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-notion-text mb-4">Invite New User</h2>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-notion-text-tertiary uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-notion-accent outline-none bg-white font-light text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-notion-text-tertiary uppercase mb-1">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-notion-accent outline-none bg-white font-light text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-notion-text-tertiary uppercase mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-notion-accent outline-none bg-white font-light text-sm"
                >
                  <option value="VIEWER">Viewer (Read only)</option>
                  <option value="APPROVER">Approver (Review workflow)</option>
                  <option value="EDITOR">Editor (Create forms)</option>
                  <option value="ADMIN">Admin (Full access)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-notion-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-medium"
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white border border-notion-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-notion-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Joined At</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-notion-text-tertiary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-notion-bg-darker flex items-center justify-center text-notion-accent font-bold text-xs">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-notion-text">
                          {user.email}
                          {user.id === currentUser?.id && (
                            <span className="ml-2 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">YOU</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <BiShield className={`w-3.5 h-3.5 ${user.role === 'ADMIN' ? 'text-notion-accent' : 'text-notion-text-tertiary'}`} />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-notion-bg-darker text-notion-text' :
                        user.role === 'EDITOR' ? 'bg-slate-50 text-slate-700' :
                          user.role === 'APPROVER' ? 'bg-purple-50 text-purple-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-notion-text-tertiary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-notion-text-tertiary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove user"
                      >
                        <BiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-12 text-center text-notion-text-tertiary italic text-sm">
              No other users found in this company.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

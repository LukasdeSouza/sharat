import { useState, useEffect } from 'react';
import { BiX, BiUser, BiShield, BiCheckCircle } from 'react-icons/bi';
import { usersService } from '../services/UsersService';
import type { User, WorkflowStep } from '../types';

interface StepConfigPanelProps {
  step: WorkflowStep | null;
  onStepUpdate: (step: WorkflowStep) => void;
  onClose: () => void;
}

export default function StepConfigPanel({ step, onStepUpdate, onClose }: StepConfigPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (step?.type === 'approval') {
      loadUsers();
    }
  }, [step?.type]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!step) return null;

  const handleConfigChange = (key: string, value: any) => {
    onStepUpdate({
      ...step,
      config: {
        ...step.config,
        [key]: value
      }
    });
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-full shadow-xl z-10 animate-in slide-in-from-right duration-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800">Step Configuration</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors">
          <BiX className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Common Settings */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Step Name</label>
          <input
            type="text"
            value={step.name}
            onChange={(e) => onStepUpdate({ ...step, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="e.g. Manager Approval"
          />
        </div>

        {/* Approval Specific Settings */}
        {step.type === 'approval' && (
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BiShield className="text-purple-500" />
              Approval Settings
            </h4>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Assign Approver</label>
              <div className="relative">
                <select
                  value={step.config.approverId || ''}
                  onChange={(e) => handleConfigChange('approverId', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none appearance-none bg-white"
                  disabled={loadingUsers}
                >
                  <option value="">Select a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email} ({user.role})
                    </option>
                  ))}
                </select>
                <BiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                This user will receive a notification when a form is submitted.
              </p>
            </div>
          </div>
        )}

        {/* Action/Logic Specific Settings (Placeholder for future) */}
        {step.type === 'action' && (
           <div className="space-y-4 border-t border-slate-100 pt-4">
             <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
               <BiCheckCircle className="text-blue-500" />
               Action Settings
             </h4>
             <p className="text-xs text-slate-500">Configure automated actions here.</p>
           </div>
        )}
      </div>
    </div>
  );
}

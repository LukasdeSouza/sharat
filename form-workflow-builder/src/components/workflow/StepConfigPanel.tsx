import { useState, useEffect } from 'react';
import type { WorkflowStep, StepConfig } from '../../types';

interface StepConfigPanelProps {
  step: WorkflowStep | null;
  onStepUpdate: (updatedStep: WorkflowStep) => void;
  onClose: () => void;
}

export default function StepConfigPanel({
  step,
  onStepUpdate,
  onClose,
}: StepConfigPanelProps) {
  const [name, setName] = useState('');
  const [config, setConfig] = useState<StepConfig>({});

  useEffect(() => {
    if (step) {
      setName(step.name);
      setConfig(step.config);
    }
  }, [step]);

  if (!step) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm">Select a step to configure</p>
        </div>
      </div>
    );
  }

  const handleUpdate = () => {
    onStepUpdate({
      ...step,
      name,
      config,
    });
  };

  const updateConfig = (key: keyof StepConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onStepUpdate({
      ...step,
      name,
      config: newConfig,
    });
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    onStepUpdate({
      ...step,
      name: newName,
      config,
    });
  };

  const renderApprovalConfig = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Approver Email
        </label>
        <input
          type="email"
          value={config.approverEmail || ''}
          onChange={(e) => updateConfig('approverEmail', e.target.value)}
          placeholder="approver@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timeout (hours)
        </label>
        <input
          type="number"
          value={config.approvalTimeout || ''}
          onChange={(e) => updateConfig('approvalTimeout', parseInt(e.target.value) || 0)}
          placeholder="24"
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>
    </>
  );

  const renderNotificationConfig = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recipients (comma-separated)
        </label>
        <input
          type="text"
          value={config.recipients?.join(', ') || ''}
          onChange={(e) => updateConfig('recipients', e.target.value.split(',').map(s => s.trim()))}
          placeholder="user1@example.com, user2@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Template
        </label>
        <textarea
          value={config.template || ''}
          onChange={(e) => updateConfig('template', e.target.value)}
          placeholder="Enter email template..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
        <p className="mt-1 text-[10px] text-gray-400 leading-tight">
          Use <code className="text-slate-600 font-bold">{"{{field_id}}"}</code> for form data,
          <code className="text-slate-600 font-bold">{"{{form_name}}"}</code>, or
          <code className="text-slate-600 font-bold">{"{{step_name}}"}</code>.
        </p>
      </div>
    </>
  );

  const renderConditionConfig = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition Expression
        </label>
        <input
          type="text"
          value={config.condition || ''}
          onChange={(e) => updateConfig('condition', e.target.value)}
          placeholder="e.g., amount > 1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          True Path (Step ID)
        </label>
        <input
          type="text"
          value={config.truePath || ''}
          onChange={(e) => updateConfig('truePath', e.target.value)}
          placeholder="Step ID for true condition"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          False Path (Step ID)
        </label>
        <input
          type="text"
          value={config.falsePath || ''}
          onChange={(e) => updateConfig('falsePath', e.target.value)}
          placeholder="Step ID for false condition"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>
    </>
  );

  const renderWebhookConfig = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Webhook URL
        </label>
        <input
          type="url"
          value={config.url || ''}
          onChange={(e) => updateConfig('url', e.target.value)}
          placeholder="https://api.example.com/webhook"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          HTTP Method
        </label>
        <select
          value={config.method || 'POST'}
          onChange={(e) => updateConfig('method', e.target.value as 'GET' | 'POST' | 'PUT')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Headers (JSON)
        </label>
        <textarea
          value={config.headers ? JSON.stringify(config.headers, null, 2) : ''}
          onChange={(e) => {
            try {
              const headers = JSON.parse(e.target.value);
              updateConfig('headers', headers);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          placeholder='{"Authorization": "Bearer token"}'
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-xs"
        />
      </div>
    </>
  );

  const renderTransformConfig = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Data Transformations
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Configure data transformations (advanced feature)
      </p>
      <textarea
        value={config.transformations ? JSON.stringify(config.transformations, null, 2) : ''}
        onChange={(e) => {
          try {
            const transformations = JSON.parse(e.target.value);
            updateConfig('transformations', transformations);
          } catch {
            // Invalid JSON, don't update
          }
        }}
        placeholder='[{"field": "name", "operation": "map", "expression": "..."}]'
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-xs"
      />
    </div>
  );

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Step Configuration</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Step Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Step Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        {/* Step Type Badge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Step Type
          </label>
          <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
            {step.type}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Step Configuration</h4>
          <div className="space-y-4">
            {step.type === 'approval' && renderApprovalConfig()}
            {step.type === 'notification' && renderNotificationConfig()}
            {step.type === 'condition' && renderConditionConfig()}
            {step.type === 'webhook' && renderWebhookConfig()}
            {step.type === 'transform' && renderTransformConfig()}
          </div>
        </div>
      </div>
    </div>
  );
}

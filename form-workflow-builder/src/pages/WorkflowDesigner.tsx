import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { WorkflowStep, WorkflowConnection, StepType, FormSchema, User } from '../types';
import { workflowValidationService } from '../services/WorkflowValidationService';
import { workflowsService } from '../services/WorkflowsService';
import { formsService } from '../services/FormsService';
import { usersService } from '../services/UsersService';
import StepLibrary from '../components/workflow/StepLibrary';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import StepConfigPanel from '../components/workflow/StepConfigPanel';
import { BiSave, BiChevronLeft, BiLoaderAlt } from 'react-icons/bi';

export default function WorkflowDesigner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formIdQuery = searchParams.get('formId');
  const workflowIdQuery = searchParams.get('id');

  const [workflowName, setWorkflowName] = useState('My Awesome Workflow');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [availableForms, setAvailableForms] = useState<FormSchema[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>(formIdQuery || '');
  const [users, setUsers] = useState<User[]>([]);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Load forms for the dropdown
        const [forms, usersData] = await Promise.all([
          formsService.getAllForms(),
          usersService.getUsers()
        ]);
        setAvailableForms(forms);
        setUsers(usersData);

        if (workflowIdQuery) {
          const w = await workflowsService.getWorkflow(workflowIdQuery);
          setWorkflowName(w.name);

          // Sanitize connections: remove connections that point to non-existent steps
          const loadedSteps = (w.steps || []).map(s => ({
            ...s,
            position: s.position || { x: 100, y: 100 }
          }));
          const validConnections = (w.connections || []).filter(conn => {
            const sourceExists = loadedSteps.some(s => s.id === conn.fromStepId);
            const targetExists = loadedSteps.some(s => s.id === conn.toStepId);
            return sourceExists && targetExists;
          });

          setSteps(loadedSteps);
          setConnections(validConnections);
          setSelectedFormId(w.formId);
        } else if (formIdQuery) {
          // If we came from a form, check if there's already a workflow for it
          const existing = await workflowsService.getWorkflowsByForm(formIdQuery);
          if (existing.length > 0) {
            const w = existing[0];
            setWorkflowName(w.name);

            // Sanitize connections: remove connections that point to non-existent steps
            const loadedSteps = (w.steps || []).map(s => ({
              ...s,
              position: s.position || { x: 100, y: 100 }
            }));
            const validConnections = (w.connections || []).filter(conn => {
              const sourceExists = loadedSteps.some(s => s.id === conn.fromStepId);
              const targetExists = loadedSteps.some(s => s.id === conn.toStepId);
              return sourceExists && targetExists;
            });

            setSteps(loadedSteps);
            setConnections(validConnections);
            setSelectedFormId(w.formId);
            // Update URL to include the workflow ID
            navigate(`/workflows?id=${w.id}&formId=${w.formId}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Failed to load workflow data:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [workflowIdQuery, formIdQuery]);

  // Validate workflow whenever steps or connections change
  useEffect(() => {
    const errors = workflowValidationService.validateWorkflow(steps, connections);
    setValidationErrors(errors);
  }, [steps, connections]);

  const handleStepAdd = (stepType: StepType) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: stepType,
      name: `New ${stepType} step`,
      config: {},
      position: {
        x: 100 + steps.length * 50,
        y: 100 + steps.length * 50
      },
    };

    setSteps([...steps, newStep]);
    setSelectedStepId(newStep.id);
  };

  const handleStepSelect = (stepId: string) => {
    setSelectedStepId(stepId);
  };

  const handleStepUpdate = (updatedStep: WorkflowStep) => {
    const updatedSteps = steps.map(s => (s.id === updatedStep.id ? updatedStep : s));
    setSteps(updatedSteps);
  };

  const handleStepMove = (stepId: string, position: { x: number; y: number }) => {
    const updatedSteps = steps.map(s =>
      s.id === stepId ? { ...s, position } : s
    );
    setSteps(updatedSteps);
  };

  const handleStepDelete = (stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId));
    setConnections(connections.filter(
      c => c.fromStepId !== stepId && c.toStepId !== stepId
    ));
    if (selectedStepId === stepId) {
      setSelectedStepId(null);
    }
  };

  const handleConnectionCreate = (fromStepId: string, toStepId: string) => {
    const exists = connections.some(
      c => c.fromStepId === fromStepId && c.toStepId === toStepId
    );
    if (!exists) {
      const newConnection: WorkflowConnection = {
        id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        fromStepId,
        toStepId,
      };
      setConnections([...connections, newConnection]);
    }
  };

  const handleConnectionDelete = (connectionId: string) => {
    setConnections(connections.filter(c => c.id !== connectionId));
  };

  const handleSave = async () => {
    if (!selectedFormId) {
      setSaveMessage('Error: Please select a form for this workflow.');
      setTimeout(() => setSaveMessage(null), 5000);
      return;
    }

    try {
      setIsSaving(true);
      if (workflowIdQuery) {
        await workflowsService.updateWorkflow(workflowIdQuery, {
          name: workflowName,
          steps,
          connections,
        });
        setSaveMessage('Workflow updated! ✓');
      } else {
        const newWorkflow = await workflowsService.createWorkflow({
          formId: selectedFormId,
          name: workflowName,
          steps,
          connections,
        });
        setSaveMessage('Workflow created! ✓');
        // Update URL
        navigate(`/workflows?id=${newWorkflow.id}&formId=${selectedFormId}`, { replace: true });
      }
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage(`Error: ${err.response?.data?.error || 'Failed to save workflow'}`);
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Safety net: Ensure we only pass valid connections to the canvas to prevent crashes
  // This filters out any connection where the source or target step doesn't exist in the current steps list
  const safeConnections = useMemo(() => {
    return connections.filter(conn => {
      const sourceStep = steps.find(s => s.id === conn.fromStepId);
      const targetStep = steps.find(s => s.id === conn.toStepId);
      return sourceStep?.position && targetStep?.position;
    });
  }, [steps, connections]);

  const selectedStep = steps.find(s => s.id === selectedStepId) || null;
  const selectedForm = availableForms.find(f => f.id === selectedFormId);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <BiLoaderAlt className="w-10 h-10 text-slate-400 animate-spin mb-4" />
        <p className="text-slate-500 font-light">Loading workflow designer...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Workflow Metadata */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-2xl bg-white border-none outline-none focus:ring-2 focus:ring-slate-200 rounded px-2 py-1 w-full font-semibold text-slate-800"
                placeholder="Workflow Name"
              />
              <div className="flex items-center gap-2 mt-1 px-2">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Linked Form:</span>
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="text-sm bg-transparent border-none text-slate-600 focus:ring-0 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <option value="" disabled>Select a form...</option>
                  {availableForms.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saveMessage && (
                <div
                  className={`text-sm px-3 py-1.5 rounded-full font-medium ${saveMessage.includes('Error')
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-green-50 text-green-600 border border-green-100'
                    }`}
                >
                  {saveMessage}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || validationErrors.length > 0}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-medium ${validationErrors.length > 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-black text-white hover:bg-slate-800 shadow-sm active:scale-95'
                  }`}
              >
                {isSaving ? (
                  <BiLoaderAlt className="w-5 h-5 animate-spin" />
                ) : (
                  <BiSave className="w-5 h-5" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium border border-transparent hover:border-slate-200 rounded-lg"
              >
                <BiChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {/* {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
              <div className="text-red-500 mt-0.5">⚠️</div>
              <div className="flex-1">
                {validationErrors.map((error, index) => (
                  <p key={index} className="text-xs font-medium text-red-700">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Main Workflow Designer Interface */}
      <div className="flex-1 flex overflow-hidden">
        <StepLibrary onStepSelect={handleStepAdd} />
        <WorkflowCanvas
          steps={steps}
          connections={safeConnections}
          selectedStepId={selectedStepId}
          onStepAdd={handleStepAdd}
          onStepSelect={handleStepSelect}
          onStepMove={handleStepMove}
          onStepDelete={handleStepDelete}
          onConnectionCreate={handleConnectionCreate}
          onConnectionDelete={handleConnectionDelete}
        />
        <StepConfigPanel
          step={selectedStep}
          users={users}
          fields={selectedForm?.fields || []}
          onStepUpdate={handleStepUpdate}
          onClose={() => setSelectedStepId(null)}
        />
      </div>
    </div>
  );
}

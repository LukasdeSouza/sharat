import { useState } from 'react';
import type { WorkflowStep, WorkflowConnection, StepType } from '../../types';

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  connections: WorkflowConnection[];
  selectedStepId: string | null;
  onStepAdd: (stepType: StepType) => void;
  onStepSelect: (stepId: string) => void;
  onStepMove: (stepId: string, position: { x: number; y: number }) => void;
  onStepDelete: (stepId: string) => void;
  onConnectionCreate: (fromStepId: string, toStepId: string) => void;
  onConnectionDelete: (connectionId: string) => void;
}

export default function WorkflowCanvas({
  steps,
  connections,
  selectedStepId,
  onStepAdd,
  onStepSelect,
  onStepMove,
  onStepDelete,
  onConnectionCreate,
  onConnectionDelete,
}: WorkflowCanvasProps) {
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Miro-style connection state
  const [tempConnection, setTempConnection] = useState<{
    fromStepId: string;
    fromPos: { x: number; y: number };
    toPos: { x: number; y: number };
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stepType = e.dataTransfer.getData('stepType') as StepType;

    if (stepType) {
      onStepAdd(stepType);
    }
  };

  const handleStepMouseDown = (e: React.MouseEvent, stepId: string) => {
    if (e.button !== 0) return; // Only left click
    if ((e.target as HTMLElement).closest('.connection-port')) return; // Don't drag if clicking port

    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggedStep(stepId);
    onStepSelect(stepId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const canvas = e.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + canvas.scrollLeft;
    const y = e.clientY - rect.top + canvas.scrollTop;

    if (draggedStep) {
      onStepMove(draggedStep, {
        x: x - dragOffset.x,
        y: y - dragOffset.y,
      });
    }

    if (tempConnection) {
      setTempConnection({
        ...tempConnection,
        toPos: { x, y }
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedStep(null);
    setTempConnection(null);
  };

  const handlePortMouseDown = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const fromPos = {
      x: step.position.x + 120, // Center of 240px card
      y: step.position.y + 80,  // Bottom of card (approx)
    };

    setTempConnection({
      fromStepId: stepId,
      fromPos,
      toPos: fromPos,
    });
  };

  const handleStepMouseUp = (e: React.MouseEvent, stepId: string) => {
    if (tempConnection && tempConnection.fromStepId !== stepId) {
      onConnectionCreate(tempConnection.fromStepId, stepId);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    onStepDelete(stepId);
  };

  const getStepIcon = (type: StepType): string => {
    const icons: Record<StepType, string> = {
      approval: '',
      notification: '',
      transform: '',
      condition: '',
      webhook: '',
    };
    return icons[type];
  };

  const getStepColor = (type: StepType): string => {
    const colors: Record<StepType, string> = {
      approval: 'bg-green-100 border-green-300',
      notification: 'bg-slate-100 border-slate-300',
      transform: 'bg-purple-100 border-purple-300',
      condition: 'bg-yellow-100 border-yellow-300',
      webhook: 'bg-orange-100 border-orange-300',
    };
    return colors[type];
  };

  const getConnectionPath = (fromStep: WorkflowStep, toStep: WorkflowStep): string => {
    const fromX = fromStep.position.x + 120;
    const fromY = fromStep.position.y + 80;
    const toX = toStep.position.x + 120;
    const toY = toStep.position.y;

    // Bezier curve for smoother lines
    const midY = (fromY + toY) / 2;
    return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
  };

  return (
    <div
      className="flex-1 bg-gray-50 overflow-auto relative cursor-default"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      {steps.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">No workflow steps yet</p>
            <p className="text-sm mt-1">Drag steps from the library</p>
          </div>
        </div>
      ) : (
        <div className="relative min-h-full" style={{ minWidth: '2000px', minHeight: '2000px' }}>
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((connection) => {
              const fromStep = steps.find(s => s.id === connection.fromStepId);
              const toStep = steps.find(s => s.id === connection.toStepId);

              if (!fromStep || !toStep) return null;

              return (
                <g key={connection.id}>
                  <path
                    d={getConnectionPath(fromStep, toStep)}
                    stroke="#CBD5E1"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                  <circle
                    cx={(fromStep.position.x + toStep.position.x + 240) / 2}
                    cy={(fromStep.position.y + toStep.position.y + 80) / 2}
                    r="10"
                    fill="white"
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    className="cursor-pointer pointer-events-auto hover:stroke-red-500 hover:text-red-500"
                    onClick={() => onConnectionDelete(connection.id)}
                  />
                  <text
                    x={(fromStep.position.x + toStep.position.x + 240) / 2}
                    y={(fromStep.position.y + toStep.position.y + 82) / 2}
                    textAnchor="middle"
                    fontSize="12"
                    className="pointer-events-none fill-slate-400"
                  >
                    ×
                  </text>
                </g>
              );
            })}

            {/* Ghost connection while dragging */}
            {tempConnection && (
              <path
                d={`M ${tempConnection.fromPos.x} ${tempConnection.fromPos.y} C ${tempConnection.fromPos.x} ${(tempConnection.fromPos.y + tempConnection.toPos.y) / 2}, ${tempConnection.toPos.x} ${(tempConnection.fromPos.y + tempConnection.toPos.y) / 2}, ${tempConnection.toPos.x} ${tempConnection.toPos.y}`}
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            )}

            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#CBD5E1" />
              </marker>
            </defs>
          </svg>

          {/* Workflow steps */}
          {steps.map((step) => (
            <div
              key={step.id}
              className={`absolute w-60 bg-white rounded-xl border-2 shadow-sm transition-all select-none ${selectedStepId === step.id
                ? 'border-slate-400 shadow-md scale-[1.02]'
                : 'border-slate-200 hover:border-slate-300'
                }`}
              style={{
                left: `${step.position.x}px`,
                top: `${step.position.y}px`,
                zIndex: 2,
              }}
              onMouseDown={(e) => handleStepMouseDown(e, step.id)}
              onMouseUp={(e) => handleStepMouseUp(e, step.id)}
            >
              <div className={`h-2 w-full rounded-t-lg ${getStepColor(step.type)}`} />

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-semibold text-sm text-slate-800 truncate">
                    {step.name}
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, step.id)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="text-xs text-slate-500 capitalize flex items-center gap-1">
                  {getStepIcon(step.type)}
                  {step.type}
                </div>
              </div>

              {/* Connection Port (Bottom Center) */}
              <div
                className="connection-port absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-slate-300 rounded-full cursor-crosshair hover:border-slate-500 hover:scale-125 transition-all flex items-center justify-center"
                onMouseDown={(e) => handlePortMouseDown(e, step.id)}
              >
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import type { StepType } from '../../types';
import { BsCheck2 } from 'react-icons/bs';
import { BiLink, BiNotification, BiQuestionMark } from 'react-icons/bi';
// import { MdChangeCircle, MdChangeHistory } from 'react-icons/md';
// import { GiHalfLog } from 'react-icons/gi';

interface StepTypeInfo {
  type: StepType;
  label: string;
  icon: ReactNode;
  description: string;
}

const stepTypes: StepTypeInfo[] = [
  { type: 'approval', label: 'Approval', icon: <BsCheck2/>, description: 'Require approval from user' },
  { type: 'notification', label: 'Notification', icon: <BiNotification/>, description: 'Send email notification' },
  // { type: 'transform', label: 'Transform', icon: <MdChangeHistory/>, description: 'Transform data' },
  { type: 'condition', label: 'Condition', icon: <BiQuestionMark/>, description: 'Conditional branching' },
  { type: 'webhook', label: 'Webhook', icon: <BiLink/>, description: 'Call external API' },
];

interface StepLibraryProps {
  onStepSelect: (stepType: StepType) => void;
}

export default function StepLibrary({ onStepSelect }: StepLibraryProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Workflow Steps</h2>
      <div className="space-y-2">
        {stepTypes.map((step) => (
          <button
            key={step.type}
            onClick={() => onStepSelect(step.type)}
            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-slate-500 hover:bg-slate-50 transition-all cursor-pointer group"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('stepType', step.type);
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <span className="text-2xl flex-shrink-0">{step.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-gray-800 group-hover:text-slate-600">
                {step.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {step.description}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p className="font-medium mb-1">quick tip:</p>
        <p>Drag steps to the canvas or click to add them to your workflow.</p>
      </div>
    </div>
  );
}

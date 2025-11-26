import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  RiPlayCircleLine, 
  RiTimeLine, 
  RiMessage2Line,
  RiGitBranchLine,
  RiKeyLine,
  RiTimerLine,
  RiSendPlaneLine,
  RiMailLine,
  RiCodeLine,
  RiUserLine,
  RiRobotLine,
  RiDatabase2Line,
  RiSettings3Line
} from '@remixicon/react';

const nodeStyles = {
  trigger: {
    bg: 'bg-white',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  condition: {
    bg: 'bg-white',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: 'text-yellow-600',
    dot: 'bg-yellow-500',
  },
  action: {
    bg: 'bg-white',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    icon: 'text-green-600',
    dot: 'bg-green-500',
  },
  ai: {
    bg: 'bg-white',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    icon: 'text-purple-600',
    dot: 'bg-purple-500',
  },
};

const iconMap: any = {
  TRIGGER_MESSAGE: RiMessage2Line,
  TRIGGER_WAIT: RiTimeLine,
  TRIGGER_INACTIVITY: RiTimerLine,
  TRIGGER_USER_INPUT: RiKeyLine,
  
  CONDITION_KEYWORD: RiKeyLine,
  CONDITION_EQUALS: RiGitBranchLine,
  CONDITION_CONTAINS: RiKeyLine,
  CONDITION_VARIABLE: RiSettings3Line,
  
  ACTION_MESSAGE: RiSendPlaneLine,
  ACTION_EMAIL: RiMailLine,
  ACTION_API_CALL: RiCodeLine,
  ACTION_ASSIGN_HUMAN: RiUserLine,
  ACTION_SET_VARIABLE: RiSettings3Line,
  
  AI_RESPONSE: RiRobotLine,
  AI_SEARCH_KB: RiDatabase2Line,
  AI_EXTRACT_INFO: RiSettings3Line,
};

function getNodeCategory(type: string): keyof typeof nodeStyles {
  if (type.startsWith('TRIGGER_')) return 'trigger';
  if (type.startsWith('CONDITION_')) return 'condition';
  if (type.startsWith('ACTION_')) return 'action';
  if (type.startsWith('AI_')) return 'ai';
  return 'action';
}

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const category = getNodeCategory(data.type);
  const style = nodeStyles[category];
  const Icon = iconMap[data.type] || RiSettings3Line;
  
  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-xl shadow-sm hover:shadow-md transition-all min-w-[200px] ${
      selected ? 'ring-2 ring-primary shadow-lg' : ''
    }`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 border-2 border-border bg-white" 
      />
      
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${style.badge} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={style.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">{data.label}</div>
            {data.description && (
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{data.description}</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Config indicator */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="px-4 pb-3">
          <div className={`text-xs px-2 py-1 rounded ${style.badge} inline-flex items-center gap-1`}>
            <RiSettings3Line size={12} />
            Geconfigureerd
          </div>
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 border-2 border-border bg-white" 
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

// Start node (special trigger node)
export const StartNode = memo(({ selected }: NodeProps) => {
  return (
    <div className={`px-4 py-3 rounded-full border-2 shadow-md bg-gradient-to-r from-primary to-primary/80 text-primary-foreground ${
      selected ? 'ring-2 ring-primary' : ''
    }`}>
      <div className="flex items-center gap-2">
        <RiPlayCircleLine size={20} />
        <div className="font-semibold">Start</div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

StartNode.displayName = 'StartNode';

// Node types for ReactFlow
export const nodeTypes = {
  custom: CustomNode,
  start: StartNode,
};

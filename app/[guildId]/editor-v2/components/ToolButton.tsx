import { LucideIcon } from 'lucide-react';
import { TooltipButton } from '@/app/components/TooltipButton';
interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  send?: boolean;
  add?: boolean;
}
function ToolButton({ icon: Icon, label, onClick, active, send }: ToolButtonProps) {
  return (
    <TooltipButton
      onClick={onClick}
      tooltipText={label}
      tooltipSide='left'
      icon={<Icon size={16} />}
      buttonClassName={`flex flex-col items-center gap-1 p-2 w-10 transition-all group relative cursor-pointer bg-neutral-900/40 hover:bg-white/5
          ${active ? 'text-indigo-500 hover:text-indigo-400' : 'text-zinc-500 hover:text-zinc-200'}
          ${send ? 'text-indigo-500! hover:text-indigo-400!' : ''}
      `}
    >
    </TooltipButton>
  );
}

export default ToolButton;
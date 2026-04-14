import React, { useState } from 'react';
import { Tooltip } from '@heroui/react';
import { BlockAction } from '@/types/editor';

interface BlockWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  actions?: BlockAction[];
}

export const BlockWrapper = ({ children, className = "", style, actions = [] }: BlockWrapperProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

  return (
    <div
      className={`relative group rounded-lg transition-colors border border-transparent ${isHovered ? 'bg-[#2e3035] border-zinc-700' : ''} ${className}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && actions.length > 0 && (
        <div className="absolute -top-3 right-0 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg flex items-center z-10">
          {actions.map((action, index) => (
            action.noButton ? (
              <div key={index}>
                {action.icon}
              </div>
            ) : (
              <Tooltip key={index} closeDelay={0} isOpen={tooltipIndex === index}>
                <Tooltip.Trigger>
                  <button 
                    onClick={() => {
                      setTooltipIndex(null);
                      action.onClick();
                    }}
                    className={`p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer rounded-md ${action.variant === 'danger' ? 'hover:bg-red-900/50! hover:text-red-400!' : ''}`}
                    {...(action['data-color-button'] && { 'data-color-button': true })}
                    onMouseEnter={() => setTooltipIndex(index)}
                    onMouseLeave={() => setTooltipIndex(null)}
                    onFocus={() => setTooltipIndex(null)}
                  >
                    {action.icon}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content className="px-3">
                  <p>{action.tooltip}</p>
                </Tooltip.Content>
              </Tooltip>
            )
          ))}
        </div>
      )}
    </div>
  );
};
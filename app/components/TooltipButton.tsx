"use client";

import { Button, ButtonProps, PressEvent } from "@heroui/react";
import { Tooltip, Kbd } from "@heroui/react";
import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

interface TooltipButtonProps extends Omit<ButtonProps, "size" | "variant"> {
  activeTool?: boolean;
  icon?: ReactNode;
  text?: ReactNode;
  kdbContent?: string;
  kdbText?: string;
  IconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  variant?:
    | "outline"
    | "danger"
    | "tertiary"
    | "danger-soft"
    | "ghost"
    | "primary"
    | "secondary"
    | undefined;
  tooltipText?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  tooltipClassName?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export function TooltipButton({
  activeTool = true,
  icon,
  text,
  kdbContent,
  kdbText,
  IconOnly = false,
  size = "md",
  variant = "tertiary",
  tooltipText,
  tooltipSide = "top",
  tooltipClassName,
  buttonClassName,
  onPress,
  disabled,
  ...props
}: TooltipButtonProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleClick = (e: PressEvent) => {
    setIsTooltipOpen(false);
    onPress?.(e);
  };

  return (
    <Tooltip closeDelay={0} isOpen={isTooltipOpen}>
      <Tooltip.Trigger>
        <Button
          isIconOnly={IconOnly}
          size={size}
          variant={variant}
          className={cn(buttonClassName, "min-w-0")}
          onPress={handleClick}
          isDisabled={disabled}
          onMouseEnter={() => setIsTooltipOpen(true)}
          onMouseLeave={() => setIsTooltipOpen(false)}
          onFocus={() => setIsTooltipOpen(false)}
          {...props}
        >
          {icon}
          {text}
        </Button>
      </Tooltip.Trigger>
      {activeTool && (
        <Tooltip.Content
          placement={tooltipSide}
          className={cn(
            "bg-neutral-900 border border-neutral-800 flex items-center gap-2 px-3",
            tooltipClassName,
          )}
        >
          {tooltipText && <p>{tooltipText}</p>}
          {kdbText && (
            <div>
              {kdbContent ? kdbContent : ""}
              <Kbd>{kdbText}</Kbd>
            </div>
          )}
        </Tooltip.Content>
      )}
    </Tooltip>
  );
}

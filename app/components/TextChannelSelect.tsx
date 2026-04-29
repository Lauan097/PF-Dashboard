"use client";

import { ComboBox, Input, Label, ListBox } from "@heroui/react";
import type { Key } from "@heroui/react";
import { DiscordIcon } from "./DiscordIcons";
import { normalizeText } from "@/utils/textUtils";

interface Channels {
  id: string;
  name: string;
  color?: number;
  position?: number;
}

interface TextChannelSelectProps {
  channels: Channels[];
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  type?: "text" | "roles";
  container?: HTMLElement | null;
  disabled?: boolean;
}

export function TextChannelSelect({
  channels,
  value,
  onChange,
  label,
  placeholder = "Selecione um canal...",
  className = "",
  type = "text",
  disabled = false,
}: TextChannelSelectProps) {
  const getRoleColor = (color: number | undefined) => {
    if (!color || color === 0) return undefined;
    return `#${color.toString(16).padStart(6, "0")}`;
  };

  return (
    <div className={className}>
      <ComboBox
        fullWidth
        isDisabled={disabled}
        selectedKey={value || null}
        onSelectionChange={(key: Key | null) =>
          onChange?.((key as string) ?? "")
        }
        defaultFilter={(text, inputVal) => {
          if (!inputVal) return true;
          return normalizeText(text).includes(normalizeText(inputVal));
        }}
      >
        {label && <Label>{label}</Label>}
        <ComboBox.InputGroup>
          <Input placeholder={placeholder} />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover
          className="max-h-64! [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <ListBox>
            {channels.map((channel) => (
              <ListBox.Item
                key={channel.id}
                id={channel.id}
                textValue={channel.name}
                className="text-md font-medium text-zinc-300/90"
                style={{
                  color:
                    type === "roles" ? getRoleColor(channel.color) : undefined,
                }}
              >
                <DiscordIcon
                  name={type === "roles" ? "roles" : "text"}
                  className="shrink-0 w-5 h-5"
                  style={{
                    color:
                      type === "roles"
                        ? getRoleColor(channel.color)
                        : undefined,
                  }}
                />
                {channel.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
            </ListBox>
        </ComboBox.Popover>
      </ComboBox>
    </div>
  );
}


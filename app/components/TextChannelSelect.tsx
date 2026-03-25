'use client';
import { ComboBox, Input, Label, ListBox } from "@heroui/react";
import { DiscordIcon } from "./DiscordIcons";
import { normalizeText } from "@/utils/textUtils";

interface Channels {
  id: string;
  name: string;
  position?: number;
}

interface TextChannelSelectProps {
  channels: Channels[];
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function TextChannelSelect({
  channels,
  value,
  onChange,
  label,
  placeholder = "Selecione um canal...",
  className = ""
}: TextChannelSelectProps) {
  return (
    <div>
      <ComboBox
        className={className}
        value={value}
        onChange={(key) => onChange?.(key as string)}
        defaultFilter={(textValue, inputValue) =>
          normalizeText(textValue).includes(normalizeText(inputValue))
        }
        aria-label={label || "Selecione um canal"}
      >
        {label && <Label>{label}</Label>}
        <ComboBox.InputGroup>
          <Input placeholder={placeholder} />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover className="overflow-hidden">
          <ListBox className="overflow-y-auto max-h-60">
            {channels.map((channel) => (
              <ListBox.Item key={channel.id} id={channel.id} textValue={channel.name} aria-label={channel.name}>
                <DiscordIcon name="text" className="w-4 h-4" />
                <span>{channel.name}</span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
    </div>
  );
}
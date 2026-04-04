'use client';

import { useState, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/combobox";
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
  type?: "text" | "roles";
  container?: HTMLElement | null;
}

export function TextChannelSelect({
  channels,
  value,
  onChange,
  label,
  placeholder = "Selecione um canal...",
  className = "",
  type = "text",
  container,
}: TextChannelSelectProps) {
  const [searchText, setSearchText] = useState("");

  const selectedName = channels.find((c) => c.id === value)?.name ?? "";

  // Base UI sem `items` prop não filtra automaticamente — fazemos manualmente
  const filteredChannels = useMemo(() => {
    if (!searchText) return channels;
    return channels.filter((c) =>
      normalizeText(c.name).includes(normalizeText(searchText))
    );
  }, [channels, searchText]);

  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm text-zinc-400">{label}</label>
      )}
      <Combobox
        value={selectedName}
        onValueChange={(name) => {
          const ch = channels.find((c) => c.name === (name ?? ""));
          onChange?.(ch?.id ?? "");
          setSearchText("");
        }}
        onInputValueChange={(val, { reason }) => {
          if (reason === "input-change") {
            setSearchText(val);
          } else {
            setSearchText("");
          }
        }}
        filteredItems={filteredChannels.map((c) => c.name)}
        autoHighlight
      >
        <ComboboxInput
          placeholder={placeholder}
          showClear={!!value}
          className="w-full"
        />
        <ComboboxContent container={container}>
          <ComboboxList>
            {filteredChannels.map((channel) => (
              <ComboboxItem
                key={channel.id}
                value={channel.name}
                className="text-md font-medium text-zinc-300/90"
              >
                <DiscordIcon
                  name={type === "roles" ? "roles" : "text"}
                  className="shrink-0 text-zinc-400"
                />
                {channel.name}
              </ComboboxItem>
            ))}
          </ComboboxList>
          <ComboboxEmpty>Nenhum canal encontrado.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { BookOpen, Save } from "lucide-react";
import { Button } from "@heroui/react";

interface NotesProps {
  initialNotes: string | null;
  onSaveNotes: (notes: string) => void;
}

export default function Notes({ initialNotes, onSaveNotes }: NotesProps) {
  const [notes, setNotes] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setNotes(initialNotes || "");
      setHasChanges(false);
    }, 0);
  }, [initialNotes]);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    setHasChanges(val !== (initialNotes || ""));
  };

  const handleSave = () => {
    onSaveNotes(notes);
    setHasChanges(false);
  };

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">
            Diário e Anotações de Inquérito
          </h2>
        </div>

        {hasChanges && (
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer animation-pulse"
          >
            <Save size={13} />
            Salvar Diário
          </Button>
        )}
      </div>

      <div className="relative">
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Registre hipóteses de investigação, linhas de raciocínio, ou anotações gerais sobre suspeitos e provas..."
          rows={7}
          className="w-full bg-black/10 border border-[#27272a]/80 rounded-xl px-3 py-3 text-xs text-gray-300 leading-relaxed focus:outline-none focus:border-emerald-500/50 transition resize-none placeholder:text-gray-600"
        />
        <div className="absolute bottom-2.5 right-3 text-[9px] text-gray-500 font-medium">
          Anotação sigilosa — Acesso restrito
        </div>
      </div>
    </div>
  );
}

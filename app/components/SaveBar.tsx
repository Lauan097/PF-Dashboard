'use client';

import { Button } from '@heroui/react';

interface SaveBarProps {
  isVisible: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export const SaveBar = ({ isVisible, isSaving, onSave, onReset }: SaveBarProps) => {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-185 bg-[#252525] border border-red-500/40 font-rajdhani rounded-md py-2 px-4 flex items-center justify-between transition-all duration-300 shadow-2xl z-50 ${
        isVisible ? 'opacity-100 translate-y-0 shadow-[0px_10px_50px_rgba(0,0,0,0.6)] z-50' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <span className="text-white/80 font-medium">
        Cuidado — você tem alterações que não foram salvas!
      </span>

      <div className="flex items-center gap-2">
        <Button
          onClick={onReset}
          className="text-white text-sm bg-[#3d3d3d] hover:bg-[#333333] rounded-md"
          isDisabled={isSaving}
        >
          Redefinir
        </Button>
        
        <Button
          onClick={onSave}
          isDisabled={isSaving}
          className="bg-[#248046] hover:bg-[#1a6334] rounded-md text-white font-medium transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  );
};
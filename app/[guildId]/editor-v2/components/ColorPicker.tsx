'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
}

const presetColors = [
  // 🔵 Azuis
  '#5865F2',
  '#4752C4',
  '#3C45A5',
  '#7289DA',

  // 🟢 Verdes
  '#57F287',
  '#3BA55D',
  '#2D7D46',

  // 🔴 Vermelhos
  '#ED4245',
  '#FF0000',
  '#F23F43',

  // 🟡 Amarelos
  '#FEE75C',
  '#FAA61A',
  '#E6A700',

  // 🟣 Roxos
  '#EB459E',
  '#C73D8B',
  '#CBA6F7',
  '#8B5CF6',

  // 🔵 Azuis secundários
  '#3498DB', 
  '#74C7EC',
  '#1ABC9C', 
  '#00B0F4',

  // 🟠 Laranjas
  '#F38BA8',
  '#E67E22',
  '#FF7300',

  // ⚫ Neutros
  '#1E1F22', 
  '#2B2D31',
  '#313338',
  '#4E5058',
  '#A3A3A3', 
  '#FFFFFF', 
];


export default function ColorPicker({
  value = '#5865f2',
  onChange,
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCustomColor(e.target.value);
    onChange(e.target.value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.80 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.80 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="space-y-2 bg-neutral-900 p-4 rounded-lg font-rajdhani font-semibold max-w-45.5" 
      onClick={(e) => e.stopPropagation()}
    >

      <div className="flex items-center gap-2 py-1">
        <hr className="grow border-neutral-700" />
        <span className="text-[10px] text-gray-400">PALETA</span>
        <hr className="grow border-neutral-700" />
      </div>

      {/* Paleta */}
      <div className="flex flex-wrap gap-1.5 max-w-37.5">
        {presetColors.map((color, index) => (
          <motion.button
            key={color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01, duration: 0.1 }}
            type="button"
            onClick={() => {
              setCustomColor(color);
              onChange(color);
            }}
            className={cn(
              'w-5 h-5 rounded border transition cursor-pointer',
              value === color
                ? 'border-white scale-110'
                : 'border-gray-600 hover:scale-110'
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 py-1">
        <hr className="grow border-neutral-700" />
        <span className="text-[10px] text-gray-400">PERSONALIZADA</span>
        <hr className="grow border-neutral-700" />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={handleColorChange}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          className="w-6 h-6 rounded border border-gray-600 bg-transparent cursor-pointer"
        />

        <input
          type="text"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          placeholder="#5865f2"
          className={`${value ? 'w-20  ' : 'w-full'} px-1 py-0.5 bg-[#202022] border border-gray-700 rounded text-xs text-gray-200 outline-none focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-400 transition-colors`}
        />

        {value && (
          <hr className="border-l h-5 border-neutral-700" />
        )}

        {value && (
          <button
            type="button"
            onClick={() => {onChange(''); setCustomColor('');}}
            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition cursor-pointer"
            title="Remover cor"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

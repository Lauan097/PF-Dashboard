import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, Loader, ImageIcon } from 'lucide-react';
import { toast } from '@heroui/react';

interface ModalImageProps {
  src?: string;
  alt?: string;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onChange: (url: string) => void;
}

export const ModalImageUploader = ({
  src,
  alt,
  className,
  isOpen,
  onClose,
  onChange,
}: ModalImageProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      setError(null);
      const response = await fetch(`/api/data/upload`, {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha no upload');
      }

      onChange(data.url);
      onClose();
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : 'Erro ao enviar imagem.');
      setError(error instanceof Error ? error.message : 'Erro ao enviar imagem.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlConfirm = () => {
    if (!imageUrl.trim()) return;
    onChange(imageUrl.trim());
    setImageUrl('');
    onClose();
  };

  return (
    <>
      {src && (
        <div className={className}>
          <Image
            src={src}
            alt={alt || ''}
            width={0}
            height={0}
            className="max-w-full rounded-md border border-white/10"
          />
        </div>
      )}

      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg font-rajdhani p-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
              >
                <motion.div
                  className="w-full max-w-md rounded-xl bg-zinc-900 p-5 space-y-4"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center justify-center">
                      <ImageIcon className='mr-2 w-5 h-5 text-yellow-400' /> Inserir imagem
                    </h2>

                    <button
                      onClick={onClose}
                      className="rounded-lg p-2 text-white/50 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/70">
                      URL da imagem
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/imagem.png"
                      className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-0 
                      hover:outline-none border border-zinc-700 focus:border-blue-400 transition-colors"
                    />
                    <button
                      onClick={handleUrlConfirm}
                      className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Usar URL
                    </button>
                  </div>

                  <div className="my-6 flex items-center gap-4">
                    <hr className="grow border-neutral-700" />
                    <span className="text-xs text-gray-500">OU</span>
                    <hr className="grow border-neutral-700" />
                  </div>

                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        e.target.files && handleFileUpload(e.target.files[0])
                      }
                    />

                    <div
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);

                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className={`w-full cursor-pointer rounded-md border-2 border-dashed px-4 py-6 text-center text-sm transition
                        ${isDragging
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-700 bg-zinc-800'}
                        ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-zinc-500/20'}
                      `}
                    >
                      {isUploading ? (
                        <span className="flex items-center justify-center gap-2 text-white">
                          <Loader className="h-4 w-4 animate-spin" />
                          Enviando imagem...
                        </span>
                      ) : (
                        <span className="text-white/70 font-medium">
                          <span className='text-blue-400'>Carregue</span> ou arraste uma imagem até aqui
                        </span>
                      )}
                    </div>
                    {error && (
                      <p className="text-xs text-red-400 text-center font-semibold">{error}</p>
                    )}
                  </div>

                  <div className='mt-8'>
                    <p className="text-xs text-white/50 text-center">
                      Formatos suportados: JPEG, PNG, GIF - Tamanho máximo: 5MB.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
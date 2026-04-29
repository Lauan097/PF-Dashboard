import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X, ImageIcon, ArrowRight, History, Link, Upload } from "lucide-react";
import { Button, ScrollShadow, Spinner, Skeleton } from "@heroui/react";
import { toast } from "sonner";

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
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setIsScrollable(el.scrollWidth > el.clientWidth);
      setIsScrollEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(checkScrollability, 100);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, recentImages, loadingImages]);

  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      scrollContainerRef.current.scrollBy({
        left: e.deltaY,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    checkScrollability();
  };

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLoadingImages(true);
      fetch("/api/upload")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRecentImages(data.imagesUrl || []);
          } else {
            setRecentImages([]);
          }
        })
        .catch(() => setRecentImages([]))
        .finally(() => setLoadingImages(false));
    }
  }, [isOpen]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      setError(null);
      const response = await fetch(`/api/upload`, {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha no upload");
      }

      onChange(data.url);
      onClose();
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao enviar imagem.",
      );
      setError(
        error instanceof Error ? error.message : "Erro ao enviar imagem.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlConfirm = () => {
    if (!imageUrl.trim()) return;
    onChange(imageUrl.trim());
    setImageUrl("");
    onClose();
  };

  return (
    <>
      {src && (
        <div className={className}>
          <Image
            src={src}
            alt={alt || ""}
            width={0}
            height={0}
            className="max-w-full rounded-md border border-white/10"
            unoptimized
            priority
          />
        </div>
      )}

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg p-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
              >
                <motion.div
                  className="w-full max-w-md rounded-xl bg-[#171717] p-5 space-y-4 border border-neutral-700/80"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center justify-center">
                      <ImageIcon className="mr-2 w-5 h-5" /> Inserir imagem
                    </h2>

                    <button
                      onClick={onClose}
                      title="Fechar Modal"
                      className="rounded-lg p-2 text-white/50 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <label className="text-xs text-white/60 flex items-center gap-1">
                   <Link size={16}  />
                    URL da imagem
                  </label>
                  <div className="flex gap-2 items-end">
                    <div className="w-full">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/imagem.png"
                        className="w-full rounded-md bg-zinc-800 h-9 px-2 text-sm text-white outline-none focus:ring-0 
                        hover:outline-none border-2 border-zinc-700 focus:border-neutral-500/80 transition-colors"
                        disabled={isUploading}
                      />
                    </div>
                    <Button
                      onClick={handleUrlConfirm}
                      className="shrink-0 rounded-md bg-blue-600 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors"
                      isIconOnly
                      isDisabled={!imageUrl.trim() || isUploading}
                    >
                      <ArrowRight size={14} />
                    </Button>
                  </div>

                  <div className="my-5 flex items-center gap-4">
                    <hr className="grow border-neutral-800" />
                    <span className="text-[10px] text-gray-600">OU</span>
                    <hr className="grow border-neutral-800" />
                  </div>

                  <div className="space-y-2 border rounded-md border-neutral-800 p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        e.target.files && handleFileUpload(e.target.files[0])
                      }
                      disabled={isUploading}
                    />

                    <div
                      onClick={() =>
                        !isUploading && fileInputRef.current?.click()
                      }
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
                        ${
                          isDragging
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-zinc-700 bg-zinc-800"
                        }
                        ${isUploading ? "opacity-50 pointer-events-none text-zinc-400" : "hover:bg-zinc-500/20 text-white"}
                      `}
                    >
                      {isUploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Spinner color="current" />
                          Enviando imagem...
                        </span>
                      ) : (
                        <span className="text-white/70 font-medium">
                          <Upload size={17} className="inline-block mr-2" />
                          Enviar <span className="text-blue-400">imagem</span>
                        </span>
                      )}
                    </div>
                    {error && (
                      <p className="text-xs text-red-400 text-center font-semibold">
                        {error}
                      </p>
                    )}

                    <div className="mt-4">
                      <p className="text-[10px] text-zinc-500 text-center">
                        Formatos suportados: JPEG, PNG, GIF - Tamanho máximo: <b>5MB</b>.
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-400 pt-4 select-none">
                    <p className="text-zinc-400 flex items-center gap-1">
                      <History size={18} />
                      Uploads Recentes
                    </p>
                    <div className="relative mt-2">
                      <ScrollShadow
                        orientation="vertical"
                        style={{ height: 200 }}
                        className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      >
                      <div
                        ref={scrollContainerRef}
                        onWheel={handleWheelScroll}
                        onScroll={handleScroll}
                        className="flex flex-wrap gap-2 pb-1"
                      >
                        {loadingImages ? (
                          Array.from({ length: 32 }, (_, index) => (
                            <Skeleton key={index} className="w-23.75 h-12 sm:h-16 rounded-md shrink-0" />
                          ))
                        ) : (
                          Array.from({ length: 32 }, (_, index) => {
                            const imageUrl = recentImages[index];
                            return imageUrl ? (
                              <Image
                                key={index}
                                src={imageUrl}
                                alt="Imagem recente"
                                width={800}
                                height={800}
                                className="w-23.75 h-12 sm:h-16 object-cover rounded-md cursor-pointer border border-transparent hover:border-neutral-500 transition brightness-95 hover:brightness-110"
                                onClick={() => {
                                  onChange(imageUrl);
                                  onClose();
                                }}
                                priority
                                unoptimized
                              />
                            ) : (
                              <div
                                key={index}
                                className="w-23.75 shrink-0 h-12 sm:h-16 bg-zinc-800 rounded-md flex items-center justify-center"
                                onClick={() => {}}
                              >
                                <ImageIcon className="w-6 h-6 text-white/20" />
                              </div>
                            );
                          })
                        )}
                      </div>
                      </ScrollShadow>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};

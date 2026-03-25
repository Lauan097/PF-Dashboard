import Image from "next/image";
import { MoreHorizontal, Plus, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

type RolePill = {
  name: string;
  color: string;
};

type BotProfilePreviewProps = {
  name: string;
  tag: string;
  mutualText?: string;
  bio?: string;
  bannerUrl: string;
  avatarUrl: string;
  serverAvatarUrl?: string;
  roles?: RolePill[];
  messagePlaceholder?: string;
};

export default function BotProfilePreview({
  name,
  tag,
  mutualText = "1 servidor mútuo",
  bio = "Sentra",
  bannerUrl,
  avatarUrl,
  serverAvatarUrl,
  roles = [
    { name: "Polícia Federal", color: "#8a8f98" },
    { name: "Bots", color: "#2ecc71" },
  ],
  messagePlaceholder,
}: BotProfilePreviewProps) {
  return (
    <div
      className="w-[320px] overflow-hidden rounded-lg select-none h-fit"
      style={{
        backgroundColor: "#242429",
        boxShadow:
          "0 12px 28px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.35)",
      }}
    >
      <div className="relative h-28 w-full">
        <Image
          src={bannerUrl}
          alt="Banner"
          fill
          className="object-cover"
          sizes="320px"
          priority
          unoptimized
        />

        <button
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full"
          style={{
            backgroundColor: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(6px)",
          }}
          aria-label="Opções"
          type="button"
        >
          <MoreHorizontal className="h-5 w-5 text-white/90" />
        </button>
      </div>

      <div className="relative px-4 pb-4">
        <div className="relative -mt-10 flex items-end gap-3">
          <div className="relative h-21 w-21 shrink-0">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: "#242429",
                padding: 5,
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={avatarUrl || '/logoPF.png'}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="88px"
                  unoptimized
                />
              </div>
            </div>

            <div
              className="absolute bottom-1.5 left-13 h-6 w-6 rounded-full"
              style={{
                backgroundColor: "#2ecc71",
                border: "4px solid #242429",
              }}
            >
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="text-[20px] font-extrabold tracking-tight text-white hover:underline">
            {name}
          </div>

          <span
            className="inline-flex items-center rounded-sm px-1.5 bg-[#5865F2] text-white text-[12px] font-medium"
          >
            APP
          </span>
        </div>

        <div className="mt-1 text-[13px] font-semibold" style={{ color: "#b5bac1" }}>
          {tag}
        </div>

        <div className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: "#b5bac1" }}>
          <span className="grid h-5 w-5 place-items-center rounded-full"
          >
            <Image
              src={serverAvatarUrl || '/logoSentra.png'}
              alt="Avatar"
              className="object-cover rounded-full hover:"
              width={24}
              height={24}
              unoptimized
            />
          </span>
          <span className="hover:underline">{mutualText}</span>
        </div>

        <div className="mt-3 text-[13px] font-medium text-[#b5bac1] whitespace-pre-line">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-1 last:mb-0">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-200">
                  {children}
                </strong>
              ),
            }}
          >
            {bio}
          </ReactMarkdown>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-[12px] font-bold" style={{ color: "#b5bac1" }}>
            Cargos
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {roles.map((r) => (
              <span
                key={r.name}
                className="inline-flex items-center gap-2 rounded-full px-1 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#e6e8ea",
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: r.color }}
                />
                {r.name}
                <span className="text-white/60"><X className="h-3.5 w-3.5" /></span>
              </span>
            ))}

            <button
              className="grid h-6 w-6 place-items-center rounded-full text-white/70"
              type="button"
              aria-label="Adicionar"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="mt-4 flex items-center gap-2 rounded-xl px-3 py-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.22)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex-1 text-[13px] truncate" style={{ color: "#8b9099" }}>
            {messagePlaceholder ?? `Conversar com @${name}`}
          </div>

          <button
            className="grid h-6 w-6 place-items-center rounded-lg text-white/70"
            type="button"
            aria-label="Emoji"
          >
            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22ZM6.5 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-9.8 1.17a1 1 0 0 1 1.39.27 3.5 3.5 0 0 0 5.82 0 1 1 0 0 1 1.66 1.12 5.5 5.5 0 0 1-9.14 0 1 1 0 0 1 .27-1.4Z" clipRule="evenodd"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

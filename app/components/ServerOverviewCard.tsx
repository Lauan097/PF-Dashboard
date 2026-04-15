import Image from "next/image";
import { DiscordIcon } from "@/app/components/DiscordIcons";

type ServerOverview = {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  splashURL: string | null;
  description: string | null;     
  ownerName: string;
  membersCount: number;
  rolesCount: number;
  textChannelsCount: number;
  voiceChannelsCount: number;
  emojisCount: number;
  createdAt: string;
};

export function ServerOverviewCard({ data }: { data: ServerOverview }) {
  const headerImage =
    data.splashURL ||
    data.banner ||
    "https://i.pinimg.com/1200x/aa/55/41/aa5541d265687d1fb50d15e6088013d6.jpg";

  return (
    <div className="relative w-full max-w-7xl overflow-hidden rounded-2xl bg-[#0c0c0ca1]">
      
      <div
        className="relative h-40 w-full"
        style={{
          backgroundImage: headerImage.startsWith("http")
            ? `url(${headerImage})`
            : headerImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative px-6">
        <div className="-mt-12 flex items-end gap-4">
          <Image
            src={data.icon ?? "https://cdn.discordapp.com/embed/avatars/0.png"}
            alt={data.name ?? "Servidor"}
            className="h-24 w-24 rounded-full border-4 border-[#0f0f14] bg-[#0f0f14]"
            width={800}
            height={800}
            priority
          />

          <div className="pb-2">
            <h2 className="text-2xl font-bold text-white">
              {data.name}
            </h2>
            <p className="text-xs text-zinc-400">
              Dono: <span className="text-zinc-300">{data.ownerName}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 h-50 space-y-4">
        {data.description && (
          <p className="text-sm text-zinc-300 leading-relaxed">
            {data.description}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Membros" value={data.membersCount} icon="members" />
          <Stat label="Cargos" value={data.rolesCount} icon="roles" />
          <Stat label="Canais de Texto" value={data.textChannelsCount} icon="text" />
          <Stat label="Canais de Voz" value={data.voiceChannelsCount} icon="voice" />
          <Stat label="Emojis" value={data.emojisCount} icon="emojis" />
        </div>

        <div className="pt-4 text-center text-xs text-zinc-500 h-4">
          Criado em{" "}{new Date(data.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}

type StatProps = {
  label: string;
  value: number;
  icon?: "members" | "roles" | "text" | "voice" | "emojis";
};

function Stat({ label, value, icon }: StatProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/5">
      
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <DiscordIcon
            name={icon}
            className="h-5 w-5 text-zinc-300"
          />
        </div>
      )}

      <div className="flex flex-col text-left">
        <span className="text-lg font-bold text-white">{value}</span>
        <span className="text-xs text-zinc-400">{label}</span>
      </div>
    </div>
  );
}
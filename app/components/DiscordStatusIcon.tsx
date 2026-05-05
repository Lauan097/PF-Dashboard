const icons: Record<string, (size: number) => React.ReactNode> = {
  online: (size) => (
    <svg width={size} height={size} viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
      <circle cx="340" cy="360" r="265" fill="#40b374" />
      <circle cx="340" cy="340" r="265" fill="none" stroke="#171717" strokeWidth="50" />
    </svg>
  ),

  idle: (size) => (
    <svg width={size} height={size} viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
      <circle cx="340" cy="370" r="285" fill="#d8bd24" />
      <circle cx="240" cy="290" r="180" fill="#000" />
      <circle cx="340" cy="380" r="275" fill="none" stroke="#000" strokeWidth="30" />
    </svg>
  ),

  dnd: (size) => (
    <svg width={size} height={size} viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
      <circle cx="340" cy="340" r="260" fill="#e8413b" />
      <rect x="160" y="308" width="380" height="90" rx="32" fill="#2d2d2d" />
      <circle cx="340" cy="340" r="265" fill="none" stroke="#171717" strokeWidth="30" />
    </svg>
  ),

  offline: (size) => (
    <svg width={size} height={size} viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
      <circle cx="340" cy="340" r="285" fill="#6b7585" />
      <circle cx="340" cy="340" r="125" fill="#2d3038" />
      <circle cx="340" cy="340" r="265" fill="none" stroke="#000" strokeWidth="5" />
    </svg>
  ),
};

interface DiscordStatusIconProps {
  name: string;
  size?: number | string;
}

export default function DiscordStatusIcon({ name, size = 18 }: DiscordStatusIconProps) {
  const render = icons[name];

  if (!render) return null;

  return <>{render(Number(size))}</>;
}
import type { TensionStatus } from '@/types/geopolitical';

interface StatusBadgeProps {
  status: TensionStatus;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const STATUS_CONFIG: Record<
  TensionStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  critical: {
    label: 'Critical',
    bg: 'bg-[#e05252]/15 border-[#e05252]/40',
    text: 'text-[#e05252]',
    dot: 'bg-[#e05252]',
  },
  elevated: {
    label: 'Elevated',
    bg: 'bg-[#f0a500]/15 border-[#f0a500]/40',
    text: 'text-[#f0a500]',
    dot: 'bg-[#f0a500]',
  },
  watchlist: {
    label: 'Watchlist',
    bg: 'bg-[#58a6ff]/15 border-[#58a6ff]/40',
    text: 'text-[#58a6ff]',
    dot: 'bg-[#58a6ff]',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-[#3fb950]/15 border-[#3fb950]/40',
    text: 'text-[#3fb950]',
    dot: 'bg-[#3fb950]',
  },
};

export default function StatusBadge({
  status,
  size = 'md',
  pulse = false,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bg} ${config.text} ${
        isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span
        className={`rounded-full flex-shrink-0 ${config.dot} ${
          isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'
        } ${pulse && status === 'critical' ? 'animate-pulse' : ''}`}
      />
      {config.label}
    </span>
  );
}

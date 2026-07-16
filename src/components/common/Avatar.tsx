import { cn } from '@/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  color?: string; // kept for backward compat
  className?: string;
  onClick?: () => void;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-16 h-16 text-xl',
};

// Also support the legacy sm/md/lg as 'sm'→sm, 'md'→md, 'lg'→lg
const LEGACY_MAP: Record<string, AvatarSize> = { sm: 'sm', md: 'md', lg: 'lg' };

const BG_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
];

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name?: string): { bg: string; text: string } {
  if (!name) return BG_COLORS[0];
  const idx = name.charCodeAt(0) % BG_COLORS.length;
  return BG_COLORS[idx];
}

export function Avatar({ src, name, size = 'md', className, onClick }: AvatarProps) {
  const resolvedSize: AvatarSize = LEGACY_MAP[size] ?? size;
  const sizeClass = SIZE_CLASSES[resolvedSize];
  const { bg, text } = getColor(name);
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onClick={onClick}
        className={cn(
          'rounded-full object-cover flex-shrink-0 select-none',
          sizeClass,
          onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
          className
        )}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      title={name}
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0 select-none',
        sizeClass,
        bg,
        text,
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
    >
      {initials}
    </div>
  );
}

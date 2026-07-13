import { cn, getInitials } from '@/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' };
const colors = ['#FFE58F', '#F06277', '#60A5FA', '#34D399', '#A78BFA', '#FB923C', '#38BDF8'];

function getColor(name: string) {
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ name, size = 'md', color, className }: AvatarProps) {
  const bg = color || getColor(name);
  const isDark = bg === '#111827';
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', sizes[size], className)}
      style={{ backgroundColor: bg, color: isDark ? '#fff' : '#111827' }}
    >
      {getInitials(name || '?')}
    </div>
  );
}

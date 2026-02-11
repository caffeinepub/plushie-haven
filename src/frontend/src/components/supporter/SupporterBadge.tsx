import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';

interface SupporterBadgeProps {
  className?: string;
}

export function SupporterBadge({ className }: SupporterBadgeProps) {
  return (
    <Badge
      variant="default"
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-primary to-pink-500 text-xs font-medium text-white ${className || ''}`}
    >
      <Heart className="h-3 w-3 fill-current" />
      Supporter
    </Badge>
  );
}

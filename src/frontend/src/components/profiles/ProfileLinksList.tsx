import { ExternalLink } from 'lucide-react';
import type { Link } from '../../backend';

interface ProfileLinksListProps {
  links: Link[];
}

export function ProfileLinksList({ links }: ProfileLinksListProps) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {links.map((link, index) => {
        // Ensure URL is safe
        const url = link.url.startsWith('http://') || link.url.startsWith('https://')
          ? link.url
          : `https://${link.url}`;

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{link.displayName || url}</span>
          </a>
        );
      })}
    </div>
  );
}

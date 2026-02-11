import { linkifyText } from '../../utils/linkifyText';
import { VideoEmbed } from './VideoEmbed';

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with clickable external links and embedded videos
 * Preserves whitespace and line breaks via whitespace-pre-wrap
 * Does not use dangerouslySetInnerHTML - safe token-based rendering
 */
export function LinkifiedText({ text, className = '' }: LinkifiedTextProps) {
  const tokens = linkifyText(text);

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {tokens.map((token, index) => {
        if (token.type === 'video') {
          return (
            <div key={index} className="my-4">
              <VideoEmbed embed={token.embed} />
            </div>
          );
        }
        if (token.type === 'link') {
          return (
            <a
              key={index}
              href={token.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              {token.content}
            </a>
          );
        }
        return <span key={index}>{token.content}</span>;
      })}
    </div>
  );
}

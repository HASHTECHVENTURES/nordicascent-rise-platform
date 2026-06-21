import { cn } from "@/lib/utils";

const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/g;

function isUrl(text: string) {
  return /^https?:\/\/\S+$/i.test(text);
}

type MessageBodyProps = {
  body: string;
  className?: string;
  linkClassName?: string;
};

export function MessageBody({ body, className, linkClassName }: MessageBodyProps) {
  const parts = body.split(URL_PATTERN);

  return (
    <p className={cn("text-sm whitespace-pre-wrap break-words", className)}>
      {parts.map((part, index) =>
        isUrl(part) ? (
          <a
            key={`${index}-${part}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("underline font-medium break-all", linkClassName)}
          >
            {part}
          </a>
        ) : (
          <span key={`${index}-text`}>{part}</span>
        )
      )}
    </p>
  );
}

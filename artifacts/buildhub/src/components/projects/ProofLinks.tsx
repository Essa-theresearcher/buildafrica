import { ExternalLink, Github, PlayCircle } from "lucide-react";

interface ProofLinksProps {
  link?: string;
  repoUrl?: string;
  videoUrl?: string;
  size?: "sm" | "md";
}

/** Clearly separated proof links: Live demo · Source/Repo · Video demo. */
export function ProofLinks({ link, repoUrl, videoUrl, size = "md" }: ProofLinksProps) {
  const items: { href: string; label: string; icon: typeof ExternalLink }[] = [];
  if (link) items.push({ href: link, label: "Live", icon: ExternalLink });
  if (repoUrl) items.push({ href: repoUrl, label: "Source", icon: Github });
  if (videoUrl) items.push({ href: videoUrl, label: "Video", icon: PlayCircle });

  if (items.length === 0) return null;

  const pad = size === "sm" ? "5px 10px" : "7px 12px";
  const fontSize = size === "sm" ? 12 : 13;
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: pad,
            borderRadius: 9,
            border: "1px solid var(--border)",
            background: "var(--surface-elevated)",
            color: "var(--text-secondary)",
            fontSize,
            fontWeight: 600,
            textDecoration: "none",
            transition: "border-color 140ms ease, color 140ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <Icon style={{ width: iconSize, height: iconSize }} />
          {label}
        </a>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { ImageOff, PlayCircle, X, ChevronLeft, ChevronRight, Video } from "lucide-react";
import type { ProjectScreenshot } from "../../types";
import { getVideoEmbed } from "../../lib/media";

interface ProjectMediaProps {
  name: string;
  screenshots?: ProjectScreenshot[];
  videoUrl?: string;
}

/** Screenshot gallery (with lightbox) + embedded video demo. Renders a clean
 *  empty state when a project has no visual media. */
export function ProjectMedia({ name, screenshots, videoUrl }: ProjectMediaProps) {
  const shots = (screenshots ?? []).filter((s) => s?.url);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const hasShots = shots.length > 0;
  const hasVideo = !!videoUrl;

  if (!hasShots && !hasVideo) {
    return (
      <div
        style={{
          borderRadius: 12,
          border: "1px dashed var(--border)",
          background: "var(--surface-elevated)",
          padding: "26px 20px",
          textAlign: "center",
        }}
      >
        <ImageOff style={{ width: 22, height: 22, color: "var(--text-muted)", margin: "0 auto 8px" }} />
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          No screenshots or video demo yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {hasVideo && <VideoEmbed url={videoUrl!} name={name} />}

      {hasShots && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px" }}>
            Screenshots
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
            }}
          >
            {shots.map((shot, i) => (
              <ScreenshotThumb key={i} shot={shot} onClick={() => setLightbox(i)} />
            ))}
          </div>
        </div>
      )}

      {lightbox !== null && hasShots && (
        <Lightbox
          shots={shots}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNavigate={(next) => setLightbox(next)}
        />
      )}
    </div>
  );
}

/* ── Single thumbnail with graceful broken-image fallback ───────── */
function ScreenshotThumb({ shot, onClick }: { shot: ProjectScreenshot; onClick: () => void }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        style={{
          aspectRatio: "16 / 10",
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--surface-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageOff style={{ width: 18, height: 18, color: "var(--text-muted)" }} />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      title={shot.alt}
      style={{
        position: "relative",
        padding: 0,
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "zoom-in",
        background: "var(--surface-elevated)",
        aspectRatio: "16 / 10",
        display: "block",
      }}
    >
      <img
        src={shot.url}
        alt={shot.alt}
        loading="lazy"
        onError={() => setBroken(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </button>
  );
}

/* ── Lightbox / enlarge view ────────────────────────────────────── */
function Lightbox({
  shots,
  index,
  onClose,
  onNavigate,
}: {
  shots: ProjectScreenshot[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const total = shots.length;
  const prev = () => onNavigate((index - 1 + total) % total);
  const next = () => onNavigate((index + 1) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });

  const shot = shots[index];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X style={{ width: 20, height: 20 }} />
      </button>

      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Previous"
          style={navBtnStyle("left")}
        >
          <ChevronLeft style={{ width: 24, height: 24 }} />
        </button>
      )}

      <figure
        onClick={(e) => e.stopPropagation()}
        style={{ margin: 0, maxWidth: "min(1100px, 92vw)", maxHeight: "88vh", display: "flex", flexDirection: "column", gap: 12 }}
      >
        <img
          src={shot.url}
          alt={shot.alt}
          style={{
            maxWidth: "100%",
            maxHeight: "78vh",
            objectFit: "contain",
            borderRadius: 12,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        />
        <figcaption style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
          <span>{shot.alt}</span>
          {total > 1 && (
            <span style={{ color: "rgba(255,255,255,0.55)" }}>· {index + 1} / {total}</span>
          )}
        </figcaption>
      </figure>

      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Next"
          style={navBtnStyle("right")}
        >
          <ChevronRight style={{ width: 24, height: 24 }} />
        </button>
      )}
    </div>
  );
}

function navBtnStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    [side]: 16,
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

/* ── Embedded video player ──────────────────────────────────────── */
function VideoEmbed({ url, name }: { url: string; name: string }) {
  const embed = getVideoEmbed(url);

  if (embed.type === "youtube" || embed.type === "loom") {
    return (
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 5 }}>
          <Video style={{ width: 11, height: 11 }} /> Video demo
        </p>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--border)",
            background: "#000",
          }}
        >
          <iframe
            src={embed.embedUrl}
            title={`${name} video demo`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          />
        </div>
      </div>
    );
  }

  if (embed.type === "file") {
    return (
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 5 }}>
          <Video style={{ width: 11, height: 11 }} /> Video demo
        </p>
        <video
          src={embed.fileUrl}
          controls
          preload="metadata"
          style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", background: "#000", display: "block" }}
        />
      </div>
    );
  }

  // Unknown host — fall back to a link rather than a broken embed.
  return (
    <a
      href={embed.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--surface-elevated)",
        color: "var(--accent)",
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      <PlayCircle style={{ width: 15, height: 15 }} />
      Watch video demo
    </a>
  );
}

export type VideoEmbed =
  | { type: "youtube"; embedUrl: string }
  | { type: "loom"; embedUrl: string }
  | { type: "file"; fileUrl: string }
  | { type: "unknown"; href: string };

export function getVideoEmbed(url: string): VideoEmbed {
  const raw = url.trim();

  const yt = parseYouTube(raw);
  if (yt) return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${yt}` };

  const loom = parseLoom(raw);
  if (loom) return { type: "loom", embedUrl: `https://www.loom.com/embed/${loom}` };

  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(raw)) {
    return { type: "file", fileUrl: raw };
  }

  return { type: "unknown", href: raw };
}

function parseYouTube(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseLoom(url: string): string | null {
  const m = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);
  return m ? m[1] : null;
}

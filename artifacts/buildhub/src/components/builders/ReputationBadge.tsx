import { ShieldCheck, Package, Handshake, Zap, Coffee } from "lucide-react";
import type { ReputationTag } from "../../types";

const tagConfig: Record<ReputationTag, { cls: string; icon: React.ElementType }> = {
  "Verified Builder": { cls: "badge-verified", icon: ShieldCheck },
  "Shipped Project": { cls: "badge-shipped", icon: Package },
  "Reliable Collaborator": { cls: "badge-reliable", icon: Handshake },
  "Available for Work": { cls: "badge-available", icon: Zap },
  "Coffee & Code Member": { cls: "badge-coffee", icon: Coffee },
};

export function ReputationBadge({ tag }: { tag: ReputationTag }) {
  const { cls, icon: Icon } = tagConfig[tag];
  return (
    <span className={`badge ${cls}`}>
      <Icon className="h-3 w-3" />
      {tag}
    </span>
  );
}

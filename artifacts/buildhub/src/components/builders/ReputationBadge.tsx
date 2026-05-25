import { ShieldCheck, Package, Handshake, Zap, Coffee } from "lucide-react";
import type { ReputationTag } from "../../types";

const tagConfig: Record<ReputationTag, { cls: string; icon: React.ElementType }> = {
  "Verified Builder":       { cls: "badge badge-verified",   icon: ShieldCheck },
  "Shipped Project":        { cls: "badge badge-shipped",    icon: Package },
  "Reliable Collaborator":  { cls: "badge badge-reliable",   icon: Handshake },
  "Available for Work":     { cls: "badge badge-available",  icon: Zap },
  "Coffee & Code Member":   { cls: "badge badge-coffee",     icon: Coffee },
};

export function ReputationBadge({ tag }: { tag: ReputationTag }) {
  const { cls, icon: Icon } = tagConfig[tag];
  return (
    <span className={cls}>
      <Icon style={{ width: 10, height: 10 }} />
      {tag}
    </span>
  );
}

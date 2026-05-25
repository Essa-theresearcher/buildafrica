import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-ba-accent to-ba-accent-blue text-white hover:opacity-90 shadow-lg shadow-ba-accent/20",
  secondary: "bg-ba-surface-elevated text-ba-text border border-ba-border hover:border-ba-accent/50",
  ghost: "text-ba-text-muted hover:text-ba-text hover:bg-ba-surface-elevated",
  outline:
    "border border-ba-border text-ba-text hover:border-ba-accent hover:text-ba-accent",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  href,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

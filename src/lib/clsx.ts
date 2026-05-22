type ClassValue = string | number | boolean | undefined | null;

export function clsx(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

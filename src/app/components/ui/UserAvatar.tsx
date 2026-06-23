// ─── User Avatar ─────────────────────────────────────────────────────────────

import { cn } from "../../lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<AvatarSize, string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

export function UserAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: AvatarSize;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-amber-500/25 to-amber-600/40 flex items-center justify-center text-amber-400 font-bold shrink-0",
        SIZE_STYLES[size]
      )}
    >
      {initials}
    </div>
  );
}

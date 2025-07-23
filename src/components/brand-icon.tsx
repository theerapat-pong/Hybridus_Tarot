
import Image from "next/image";
import { cn } from "@/lib/utils";

export function MysticalIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/brand-icon.png.webp"
      alt="Mystical Icon"
      className={cn("w-14 h-14 md:w-16 md:h-16", className)}
      width={64}
      height={64}
      priority
    />
  );
}

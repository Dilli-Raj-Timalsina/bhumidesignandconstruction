import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * A neutral wordmark fallback. Replace its contents with the supplied Bhumi logo
 * when the source asset is available in public/brand.
 */
export function BrandMark({
  className,
  href = "/",
  logoSrc,
  priority = false,
}: {
  className?: string;
  href?: string;
  logoSrc?: string | null;
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="BHUMI home"
      className={cn("group inline-flex items-stretch gap-2.5", className)}
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt="BHUMI"
          width={200}
          height={56}
          className="h-10 w-auto object-contain object-left"
          priority={priority}
        />
      ) : (
        <>
          <span
            className="w-1 bg-bhumi transition-transform duration-200 group-hover:scale-y-110"
            aria-hidden="true"
          />
          <span className="flex flex-col leading-none">
            <span className="text-[17px] font-bold tracking-[0.16em] text-ink">
              BHUMI
            </span>
            <span className="mt-1 text-[8px] font-bold tracking-[0.13em] text-muted">
              DESIGN + CONSTRUCTION
            </span>
          </span>
        </>
      )}
    </Link>
  );
}

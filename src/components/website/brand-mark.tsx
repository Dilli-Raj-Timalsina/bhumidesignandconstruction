import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

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
  const source = logoSrc || "/brand/bhumi-wordmark.png";

  return (
    <Link
      href={href}
      aria-label="BHUMI home"
      className={cn(
        "group relative block h-[50px] w-[190px] overflow-hidden sm:h-[54px] sm:w-[204px]",
        className,
      )}
    >
      <Image
        src={source}
        alt="BHUMI Design & Construction"
        width={1080}
        height={1080}
        className="absolute left-[-36px] top-1/2 h-[232px] w-[232px] max-w-none -translate-y-1/2 object-contain transition-transform duration-200 group-hover:scale-[1.015] sm:left-[-39px] sm:h-[250px] sm:w-[250px]"
        priority={priority}
      />
    </Link>
  );
}

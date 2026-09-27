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
      className={cn("group inline-flex items-stretch gap-2.5", className)}
    >
      <Image
        src={source}
        alt="BHUMI Design & Construction"
        width={1080}
        height={1080}
        className="h-[50px] w-[190px] object-cover object-center transition-transform duration-200 group-hover:scale-[1.015] sm:h-[54px] sm:w-[204px]"
        priority={priority}
      />
    </Link>
  );
}

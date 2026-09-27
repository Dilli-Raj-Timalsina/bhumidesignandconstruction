import Image from "next/image";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function MediaFrame({
  src,
  alt,
  label = "Project photography",
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src?: string | null;
  alt?: string | null;
  label?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      <div
        className={cn("group relative overflow-hidden bg-canvas", className)}
      >
        <Image
          fill
          src={src}
          alt={alt || ""}
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "blueprint-grid relative isolate overflow-hidden border border-bhumi/15 bg-bhumi-light/40",
        className,
      )}
    >
      <span className="absolute left-[12%] top-[14%] h-[58%] w-[42%] border border-bhumi/25" />
      <span className="absolute bottom-[18%] right-[12%] h-[37%] w-[52%] border border-bhumi/35" />
      <span className="absolute left-[31%] top-0 h-full w-px bg-bhumi/20" />
      <span className="absolute left-0 top-[58%] h-px w-full bg-bhumi/20" />
      <span className="absolute bottom-[18%] right-[12%] h-2.5 w-2.5 rounded-full bg-bhumi" />
      <div className="absolute bottom-5 left-5 flex items-center gap-2 border border-bhumi/15 bg-white/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.13em] text-bhumi backdrop-blur-sm">
        <ImageIcon size={13} /> {label}
      </div>
    </div>
  );
}

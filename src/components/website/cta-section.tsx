import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="overflow-hidden bg-bhumi text-white">
      <div className="site-shell relative grid gap-9 py-16 md:grid-cols-[1fr_auto] md:items-end md:py-24">
        <span
          className="absolute -right-20 -top-20 h-72 w-72 border border-white/15"
          aria-hidden="true"
        />
        <span
          className="absolute bottom-0 right-[18%] h-40 w-px bg-white/20"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/70">
            Start a conversation
          </p>
          <h2 className="mt-5 max-w-3xl text-[clamp(2.35rem,4.5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.055em]">
            Planning your next project?
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
            Let&apos;s discuss how we can build it.
          </p>
        </div>
        <ButtonLink
          href="/contact"
          variant="outline"
          className="relative border-white bg-white text-bhumi hover:border-white hover:bg-transparent hover:text-white"
        >
          Start a conversation <ArrowUpRight size={17} />
        </ButtonLink>
      </div>
    </section>
  );
}

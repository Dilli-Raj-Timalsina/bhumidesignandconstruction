import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Home,
  KeyRound,
  MessageSquare,
  Phone,
  PenTool,
  RefreshCcw,
  Ruler,
  HardHat,
} from "lucide-react";
import Image from "next/image";

import {
  companyHighlights,
  processSteps,
  serviceOfferings,
} from "@/features/content/marketing";

const serviceIcons = {
  design: PenTool,
  home: Home,
  handover: KeyRound,
  renovation: RefreshCcw,
  management: ClipboardCheck,
  consultation: MessageSquare,
};

const processIcons = {
  consultation: Phone,
  design: PenTool,
  estimation: Ruler,
  construction: HardHat,
  quality: CheckCircle2,
  handover: KeyRound,
};

function RebarBackdrop() {
  return (
    <Image
      src="/images/marketing/rebar-background.jpg"
      alt=""
      aria-hidden="true"
      fill
      sizes="100vw"
      className="pointer-events-none object-cover object-center opacity-[0.2] grayscale brightness-110"
    />
  );
}

export function CompanyHighlights() {
  return (
    <section className="relative isolate overflow-hidden border-y border-line bg-white">
      <RebarBackdrop />
      <div className="site-shell relative z-10 grid grid-cols-2 sm:grid-cols-4">
        {companyHighlights.map((highlight) => (
          <div
            key={highlight.label}
            className="border-b border-line px-5 py-8 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:py-10 sm:last:border-r-0"
          >
            <p className="text-3xl font-semibold tracking-[-0.055em] text-ink md:text-4xl">
              {highlight.value}
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.13em] text-muted md:text-[11px]">
              {highlight.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServiceOfferings() {
  return (
    <div className="border-t border-line">
      {serviceOfferings.map((service) => {
        const Icon = serviceIcons[service.icon];
        return (
          <a
            key={service.number}
            href="/contact"
            className="group grid gap-5 border-b border-line py-8 transition-colors hover:bg-bhumi-light/35 md:grid-cols-[72px_minmax(0,1fr)_auto] md:items-start md:gap-10 md:py-10"
          >
            <p className="text-3xl font-semibold tracking-[-0.06em] text-bhumi/40 md:text-4xl">
              {service.number}
            </p>
            <div>
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-bhumi/15 bg-bhumi-light text-bhumi">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-semibold tracking-[-0.045em] text-ink md:text-3xl">
                  {service.title}
                </h3>
              </div>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted md:pl-[3.75rem]">
                {service.description}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors group-hover:text-bhumi md:mt-2">
              Enquire <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </a>
        );
      })}
    </div>
  );
}

export function ProcessTimeline() {
  return (
    <section className="border-y border-line bg-canvas py-16 md:py-28">
      <div className="site-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">How we work</p>
          <h2 className="section-title mt-5">Our process</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
            A transparent, step-by-step journey from your first call to the
            moment you step into your new home.
          </p>
        </div>
        <div className="relative mx-auto mt-14 max-w-4xl before:absolute before:bottom-8 before:left-6 before:top-8 before:w-px before:bg-line md:mt-20">
          {processSteps.map((step) => {
            const Icon = processIcons[step.icon];
            return (
              <article
                key={step.number}
                className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-6 pb-12 last:pb-0 md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-8 md:pb-16"
              >
                <span className="relative z-10 grid h-12 w-12 place-items-center border border-line bg-white text-bhumi md:h-14 md:w-14">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="pt-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-bhumi">
                    Step {step.number}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                    {step.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

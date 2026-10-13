import Link from "next/link";
import {
  ArrowUpRight,
  Blocks,
  Calculator,
  Landmark,
  Ruler,
} from "lucide-react";

import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getSiteContent } from "@/features/content/queries";

export const generateMetadata = () => getPageIntroMetadata("tools", "/tools");

const tools = [
  {
    href: "/tools/brick-calculator",
    title: "Brick calculator",
    copy: "Estimate brick and mortar quantities for single or double walls.",
    icon: Blocks,
  },
  {
    href: "/tools/area-converter",
    title: "Area converter",
    copy: "Convert square units alongside Ropani, Aana, Bigha, Kattha, and Dhur.",
    icon: Ruler,
  },
  {
    href: "/tools/concrete-calculator",
    title: "Concrete calculator",
    copy: "Plan cement, sand, and aggregate quantities by nominal mix ratio.",
    icon: Calculator,
  },
  {
    href: "/tools/emi-calculator",
    title: "EMI calculator",
    copy: "Understand a loan's estimated monthly instalment and total payment.",
    icon: Landmark,
  },
];

export default async function ToolsPage() {
  const site = await getSiteContent();
  return (
    <>
      <PageIntro page="tools" intro={site.pageIntros.tools} />
      <section className="py-16 md:py-24">
        <div className="site-shell grid gap-px border border-line bg-line md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-white p-7 transition-colors hover:bg-canvas md:p-9"
              >
                <Icon className="text-bhumi" size={25} strokeWidth={1.6} />
                <h2 className="mt-12 text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {tool.title}
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-7 text-muted">
                  {tool.copy}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-bhumi">
                  Open calculator <ArrowUpRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

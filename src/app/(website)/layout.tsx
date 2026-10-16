import type { Metadata } from "next";

import { ContentRefresh } from "@/components/website/content-refresh";
import { Footer } from "@/components/website/footer";
import { Header } from "@/components/website/header";
import { WhatsAppButton } from "@/components/website/whatsapp-button";
import { getSiteContent } from "@/features/content/queries";

// Render HTML and metadata per request; public Supabase reads remain cached.
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const title = site.defaultSeoTitle || "BHUMI — Design & Construction";
  const description =
    site.defaultSeoDescription ||
    site.description ||
    "Civil engineering and construction solutions for residential and institutional projects.";
  return {
    title: { default: title, template: `%s | ${site.shortName}` },
    description,
    openGraph: { title, description, siteName: site.shortName },
    twitter: { title, description },
  };
}

export default async function WebsiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const site = await getSiteContent();
  return (
    <div className="min-h-screen bg-white">
      <ContentRefresh />
      <Header
        logoSrc={site.logoImage}
        contactLabel={site.editorial.headerCta}
        pageIntros={site.pageIntros}
      />
      <main>{children}</main>
      <Footer
        companyName={site.companyName}
        location={site.address || site.location}
        email={site.email}
        phone={site.phone}
        logoSrc={site.logoImage}
        description={site.description}
        tagline={site.tagline}
        socialLinks={site.socialLinks}
      />
      <WhatsAppButton
        phone={site.phone}
        greeting={site.editorial.whatsappGreeting}
      />
    </div>
  );
}

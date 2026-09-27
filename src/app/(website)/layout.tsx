import { Footer } from "@/components/website/footer";
import { Header } from "@/components/website/header";
import { WhatsAppButton } from "@/components/website/whatsapp-button";
import { getSiteContent } from "@/features/content/queries";

export default async function WebsiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const site = await getSiteContent();
  return (
    <div className="min-h-screen bg-white">
      <Header logoSrc={site.logoImage} />
      <main>{children}</main>
      <Footer
        companyName={site.companyName}
        location={site.address || site.location}
        email={site.email}
        phone={site.phone}
        logoSrc={site.logoImage}
      />
      <WhatsAppButton phone={site.phone} />
    </div>
  );
}

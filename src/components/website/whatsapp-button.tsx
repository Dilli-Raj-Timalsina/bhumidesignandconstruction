import { MessageCircle, Phone } from "lucide-react";

function toWhatsAppNumber(phone: string | null | undefined): string {
  const digits = (phone || "9763412459").replace(/\D/g, "");
  if (digits.startsWith("977")) return digits;
  return `977${digits.replace(/^0/, "")}`;
}

export function WhatsAppButton({ phone }: { phone?: string | null }) {
  const number = toWhatsAppNumber(phone);
  const message = encodeURIComponent(
    "Hello BHUMI Design & Construction, I would like to discuss a project.",
  );

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with BHUMI Design & Construction on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 grid size-16 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.28)] transition-transform duration-200 hover:scale-105 focus-visible:scale-105 sm:bottom-7 sm:right-7"
    >
      <MessageCircle size={34} strokeWidth={2.2} aria-hidden="true" />
      <Phone
        size={14}
        strokeWidth={2.8}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      />
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap border border-line bg-white px-3 py-2 text-xs font-semibold text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Chat with BHUMI
      </span>
    </a>
  );
}

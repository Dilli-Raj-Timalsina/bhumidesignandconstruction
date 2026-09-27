"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  PhoneCall,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import { Suspense, useState } from "react";

import { logoutAction } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

import { AdminNotifier } from "./admin-notifier";

const navigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/contact", label: "Contact details", icon: PhoneCall },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration" className="space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-10 items-center gap-3 border-l-2 px-4 text-sm font-medium transition-colors",
              active
                ? "border-bhumi bg-bhumi-light text-bhumi-dark"
                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  email,
  onNavigate,
}: {
  email?: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="border-b border-line px-5 py-5">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="inline-flex items-baseline gap-2"
          aria-label="BHUMI admin dashboard"
        >
          <span className="text-lg font-extrabold tracking-[-0.07em] text-bhumi">
            BHUMI
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
            Admin
          </span>
        </Link>
      </div>
      <div className="flex-1 py-5">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="border-t border-line p-4">
        {email ? (
          <p className="truncate px-1 pb-3 text-xs text-muted" title={email}>
            {email}
          </p>
        ) : null}
        <form action={logoutAction}>
          <button
            className="flex min-h-10 w-full items-center gap-3 px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
            type="submit"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Suspense fallback={null}>
        <AdminNotifier />
      </Suspense>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <SidebarContent email={email} />
      </aside>

      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-line bg-white px-5 lg:ml-64 lg:px-8">
        <span className="text-sm font-semibold tracking-[-0.02em] text-ink lg:hidden">
          BHUMI admin
        </span>
        <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-muted lg:block">
          Content management
        </span>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center border border-line text-ink lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-navigation"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/25 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            id="admin-mobile-navigation"
            className="flex h-full w-72 flex-col bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <SidebarContent
              email={email}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <main className="min-h-[calc(100vh-4rem)] px-5 py-7 lg:ml-64 lg:px-8 lg:py-9">
        {children}
      </main>
    </div>
  );
}

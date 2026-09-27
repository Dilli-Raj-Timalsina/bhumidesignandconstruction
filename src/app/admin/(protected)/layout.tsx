import { AdminShell } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/components/admin/require-admin";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}

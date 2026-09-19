import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin-console";
import { getPublicSupabaseConfig } from "@/lib/venue-data";

export const metadata: Metadata = { title: "관리자 | MATRIX", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminConsole config={getPublicSupabaseConfig()} />;
}


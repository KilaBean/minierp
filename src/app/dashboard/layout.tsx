import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { UserHydrator } from "@/components/dashboard/UserHydrator";
import { SidebarOffset } from "@/components/dashboard/SidebarOffset";

interface BusinessRow { id: string; name: string; currency: string; }
interface ProfileRow {
  id: string; email: string; full_name: string | null;
  avatar_url: string | null; role: string; business_id: string;
  businesses: BusinessRow | null;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profileRaw } = await supabase
    .from("user_profiles")
    .select("*, businesses(*)")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as ProfileRow | null;

  const hydrationUser = profile ? {
    id:                profile.id,
    email:             profile.email,
    full_name:         profile.full_name,
    avatar_url:        profile.avatar_url,
    role:              profile.role,
    business_id:       profile.business_id,
    business_name:     profile.businesses?.name ?? "My Business",
    business_currency: profile.businesses?.currency ?? "USD",
  } : null;

  return (
    <QueryProvider>
      <UserHydrator user={hydrationUser} />
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <TopBar />
        <SidebarOffset>
          <main className="pt-16 min-h-screen">
            <div className="p-6">{children}</div>
          </main>
        </SidebarOffset>
      </div>
    </QueryProvider>
  );
}
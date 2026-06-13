import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getBusinessSettings, getTeamMembers } from "@/lib/actions/settings";
import { BusinessProfileForm } from "@/components/settings/BusinessProfileForm";
import { TeamMembers } from "@/components/settings/TeamMembers";
import { AddMemberDialog } from "@/components/settings/AddMemberDialog";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function SettingsPage() {
  // Step 1: verify the user is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/auth/login");

  // Step 2: use admin client to fetch role — bypasses RLS entirely,
  // so it always works regardless of cookie/session state in Server Components
  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await (adminClient
    .from("user_profiles") as any)
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const [business, members] = await Promise.all([
    getBusinessSettings(),
    getTeamMembers(),
  ]);

  if (!business) redirect("/dashboard");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your business profile and team"
      />

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Business profile</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Name, currency, and tax settings used across the app.</p>
        </div>
        <BusinessProfileForm business={business} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Team members</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {members.length} member{members.length !== 1 ? "s" : ""} in your business
            </p>
          </div>
          <AddMemberDialog />
        </div>
        <TeamMembers members={members as any} />
      </section>
    </div>
  );
}
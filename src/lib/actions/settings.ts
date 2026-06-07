"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { businessSettingsSchema } from "@/lib/validations";
import { ApiResponse, UserRole } from "@/types";
import { createNotification } from "./notifications";

export async function getBusinessSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminClient = createAdminClient();
  const { data: profile } = await (adminClient.from("user_profiles") as any)
    .select("businesses(*)")
    .eq("id", user.id)
    .single();
  return profile?.businesses ?? null;
}

export async function updateBusinessSettings(
  formData: FormData
): Promise<ApiResponse<null>> {
  const raw = {
    name:     formData.get("name")     as string,
    email:    formData.get("email")    as string,
    phone:    formData.get("phone")    as string,
    address:  formData.get("address")  as string,
    currency: formData.get("currency") as string,
    tax_rate: formData.get("tax_rate") as string,
  };
  const parsed = businessSettingsSchema.safeParse(raw);
  if (!parsed.success)
    return { data: null, error: parsed.error.errors[0].message, success: false };

  const supabase    = await createClient();
  const adminClient = createAdminClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { data: null, error: "Not authenticated", success: false };

  const { data: profile } = await (adminClient.from("user_profiles") as any)
    .select("business_id, role")
    .eq("id", auth.user.id)
    .single();
  if (!profile)           return { data: null, error: "Profile not found", success: false };
  if (profile.role !== "admin") return { data: null, error: "Only admins can update settings", success: false };

  const { error } = await (adminClient.from("businesses") as any)
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", profile.business_id);
  if (error) return { data: null, error: error.message, success: false };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard", "layout");
  return { data: null, error: null, success: true };
}

export async function createMember(formData: FormData): Promise<ApiResponse<null>> {
  const full_name = (formData.get("full_name") as string)?.trim();
  const email     = (formData.get("email")     as string)?.trim();
  const password  = (formData.get("password")  as string);
  const role      = (formData.get("role")      as string) as UserRole;

  if (!full_name)                      return { data: null, error: "Full name is required", success: false };
  if (!email)                          return { data: null, error: "Email is required", success: false };
  if (!password || password.length < 8) return { data: null, error: "Password must be at least 8 characters", success: false };
  if (!["admin","manager","cashier"].includes(role)) return { data: null, error: "Invalid role", success: false };

  const supabase    = await createClient();
  const adminClient = createAdminClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return { data: null, error: "Not authenticated", success: false };

  const { data: myProfile } = await (adminClient.from("user_profiles") as any)
    .select("business_id, role")
    .eq("id", me.user.id)
    .single();
  if (!myProfile)                return { data: null, error: "Profile not found", success: false };
  if (myProfile.role !== "admin") return { data: null, error: "Only admins can add members", success: false };

  const businessId = myProfile.business_id as string;

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (createError || !newUser.user)
    return { data: null, error: createError?.message ?? "Failed to create user account", success: false };

  const { error: profileError } = await (adminClient.from("user_profiles") as any)
    .insert({ id: newUser.user.id, email, full_name, role, business_id: businessId });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    return { data: null, error: profileError.message, success: false };
  }

  // Notify all business members
  await createNotification({
    business_id: businessId,
    title:       "New team member added",
    body:        `${full_name} joined as ${role}`,
    type:        "info",
    link:        "/dashboard/settings",
  });

  revalidatePath("/dashboard/settings");
  return { data: null, error: null, success: true };
}

export async function getTeamMembers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const adminClient = createAdminClient();
  const { data: profile } = await (adminClient.from("user_profiles") as any)
    .select("business_id")
    .eq("id", user.id)
    .single();
  if (!profile) return [];

  const { data } = await (adminClient.from("user_profiles") as any)
    .select("id, email, full_name, role, created_at")
    .eq("business_id", profile.business_id)
    .order("created_at");
  return data ?? [];
}

export async function updateMemberRole(
  userId: string,
  role: UserRole
): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return { data: null, error: "Not authenticated", success: false };
  if (me.user.id === userId) return { data: null, error: "You cannot change your own role", success: false };

  const { error } = await (supabase.from("user_profiles") as any)
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/settings");
  return { data: null, error: null, success: true };
}

export async function removeMember(userId: string): Promise<ApiResponse<null>> {
  const supabase    = await createClient();
  const adminClient = createAdminClient();
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return { data: null, error: "Not authenticated", success: false };
  if (me.user.id === userId) return { data: null, error: "You cannot remove yourself", success: false };

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/settings");
  return { data: null, error: null, success: true };
}

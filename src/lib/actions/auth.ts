"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/index";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/validations";
import { ApiResponse } from "@/types";

// Friendly messages for network/Supabase unavailability
function friendlyError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (
    msg.includes("fetch failed") ||
    msg.includes("ConnectTimeout") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("network") ||
    msg.includes("Failed to fetch")
  ) {
    return "Unable to reach the server. If this is your first login in a while, wait 2 minutes and try again — the database may be waking up.";
  }
  return msg;
}

export async function signIn(
  formData: FormData
): Promise<ApiResponse<{ redirect: string }>> {
  const raw = {
    email:    formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success)
    return { data: null, error: parsed.error.errors[0].message, success: false };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { data: null, error: friendlyError(error), success: false };

    revalidatePath("/", "layout");
    return { data: { redirect: "/dashboard" }, error: null, success: true };
  } catch (err) {
    return { data: null, error: friendlyError(err), success: false };
  }
}

export async function signUp(
  formData: FormData
): Promise<ApiResponse<{ message: string }>> {
  const raw = {
    full_name:        formData.get("full_name") as string,
    email:            formData.get("email") as string,
    password:         formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
    business_name:    formData.get("business_name") as string,
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success)
    return { data: null, error: parsed.error.errors[0].message, success: false };

  try {
    const supabase    = await createClient();
    const adminClient = createAdminClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email:    parsed.data.email,
      password: parsed.data.password,
      options:  { data: { full_name: parsed.data.full_name } },
    });
    if (authError || !authData.user)
      return { data: null, error: friendlyError(authError ?? "Failed to create account"), success: false };

    const { data: business, error: businessError } = await (adminClient.from("businesses") as any)
      .insert({
        name:     parsed.data.business_name,
        slug:     `${slugify(parsed.data.business_name)}-${Date.now()}`,
        currency: "GHS",
        tax_rate: 0,
      })
      .select()
      .single();

    if (businessError || !business) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return { data: null, error: friendlyError(businessError ?? "Failed to create business"), success: false };
    }

    const { error: profileError } = await (adminClient.from("user_profiles") as any)
      .insert({
        id:          authData.user.id,
        email:       parsed.data.email,
        full_name:   parsed.data.full_name,
        role:        "admin",
        business_id: (business as any).id,
      });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      await (adminClient.from("businesses") as any).delete().eq("id", (business as any).id);
      return { data: null, error: friendlyError(profileError), success: false };
    }

    return {
      data: { message: "Account created! Please check your email to verify." },
      error: null,
      success: true,
    };
  } catch (err) {
    return { data: null, error: friendlyError(err), success: false };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPassword(
  formData: FormData
): Promise<ApiResponse<{ message: string }>> {
  const raw    = { email: formData.get("email") as string };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success)
    return { data: null, error: parsed.error.errors[0].message, success: false };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`,
    });
    if (error) return { data: null, error: friendlyError(error), success: false };
    return {
      data: { message: "Password reset email sent. Check your inbox." },
      error: null,
      success: true,
    };
  } catch (err) {
    return { data: null, error: friendlyError(err), success: false };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*, businesses(*)")
      .eq("id", user.id)
      .single();
    return profile;
  } catch {
    return null;
  }
}
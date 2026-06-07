"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export interface Notification {
  id:          string;
  business_id: string;
  user_id:     string | null;
  title:       string;
  body:        string | null;
  type:        "info" | "warning" | "success" | "error";
  read:        boolean;
  link:        string | null;
  created_at:  string;
}

interface CreateNotificationInput {
  business_id: string;
  user_id?:    string | null;
  title:       string;
  body?:       string;
  type?:       "info" | "warning" | "success" | "error";
  link?:       string;
}

// Called from other server actions — uses admin client to bypass RLS
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const adminClient = createAdminClient();
    await (adminClient.from("notifications") as any).insert({
      business_id: input.business_id,
      user_id:     input.user_id ?? null,
      title:       input.title,
      body:        input.body ?? null,
      type:        input.type ?? "info",
      link:        input.link ?? null,
    });
  } catch (err) {
    // Never throw — notifications are non-critical
    console.error("Failed to create notification:", err);
  }
}

export async function getNotifications(limit = 20): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await (supabase.from("notifications") as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Notification[];
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await (supabase.from("notifications") as any)
    .select("id", { count: "exact", head: true })
    .eq("read", false);
  return count ?? 0;
}

export async function markAsRead(id: string): Promise<void> {
  const supabase = await createClient();
  await (supabase.from("notifications") as any)
    .update({ read: true })
    .eq("id", id);
  revalidatePath("/dashboard", "layout");
}

export async function markAllAsRead(): Promise<void> {
  const supabase = await createClient();
  await (supabase.from("notifications") as any)
    .update({ read: true })
    .eq("read", false);
  revalidatePath("/dashboard", "layout");
}

export async function deleteNotification(id: string): Promise<void> {
  const supabase = await createClient();
  await (supabase.from("notifications") as any).delete().eq("id", id);
  revalidatePath("/dashboard", "layout");
}

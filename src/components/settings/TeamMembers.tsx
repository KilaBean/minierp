"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateMemberRole, removeMember } from "@/lib/actions/settings";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils/index";

interface Member {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const roleColors: Record<string, string> = {
  admin:   "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  manager: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  cashier: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
};

export function TeamMembers({ members }: { members: Member[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);
  const router      = useRouter();

  async function handleRoleChange(userId: string, role: UserRole) {
    setPendingId(userId);
    const result = await updateMemberRole(userId, role);
    if (!result.success) toast.error(result.error ?? "Failed to update role");
    else { toast.success("Role updated"); router.refresh(); }
    setPendingId(null);
  }

  async function handleRemove(userId: string) {
    setPendingId(userId);
    const result = await removeMember(userId);
    if (!result.success) toast.error(result.error ?? "Failed to remove member");
    else { toast.success("Member removed"); router.refresh(); }
    setPendingId(null);
    setConfirmId(null);
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users size={17} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Team Members</h3>
          <p className="text-xs text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""} in this business</p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {members.map((member) => {
          const isMe     = member.id === currentUser?.id;
          const isPending = pendingId === member.id;

          return (
            <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {member.full_name ? getInitials(member.full_name) : member.email[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.full_name ?? member.email}
                  </p>
                  {isMe && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">You</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>

              {/* Role selector */}
              {!isMe && currentUser?.role === "admin" ? (
                <select
                  value={member.role}
                  disabled={isPending}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                  className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              ) : (
                <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize", roleColors[member.role] ?? roleColors.cashier)}>
                  {member.role}
                </span>
              )}

              {/* Remove */}
              {!isMe && currentUser?.role === "admin" && (
                confirmId === member.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground hidden sm:inline">Remove?</span>
                    <button onClick={() => setConfirmId(null)} className="text-xs px-2 py-1 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">No</button>
                    <button onClick={() => handleRemove(member.id)} disabled={isPending}
                      className="text-xs px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-60">
                      {isPending ? <Loader2 size={11} className="animate-spin" /> : "Yes"}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(member.id)} disabled={isPending}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40">
                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Role legend */}
      <div className="px-5 py-3 border-t border-border bg-muted/30">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span><strong className="text-foreground">Admin</strong> — Full access, settings, team management</span>
          <span><strong className="text-foreground">Manager</strong> — Sales, inventory, customers, reports</span>
          <span><strong className="text-foreground">Cashier</strong> — POS and dashboard only</span>
        </div>
      </div>
    </div>
  );
}

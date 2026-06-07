"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types";

interface Props {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    business_id: string;
    business_name: string;
    business_currency: string;
  } | null;
}

export function UserHydrator({ user }: Props) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (user) {
      setUser({ ...user, role: user.role as UserRole });
    }
  }, [user, setUser]);

  return null;
}

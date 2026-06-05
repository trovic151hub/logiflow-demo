import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getCurrentUser, type Role, type User } from "./mock-store";

export function useRequireAuth(role: Role): User | null {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate({ to: "/login", search: { role } });
      return;
    }
    if (u.role !== role) {
      navigate({ to: u.role === "rider" ? "/rider" : "/customer" });
      return;
    }
    setUser(u);
  }, [navigate, role]);
  return user;
}
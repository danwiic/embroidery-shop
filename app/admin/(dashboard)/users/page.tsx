"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageLoader } from "@/components/ui/page-loader";
import { Shield, User, Calendar } from "lucide-react";

type UserData = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
};

const UsersContent = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user: UserData) => {
    const newRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers();
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
      </div>

      <Card className="overflow-hidden">
        {users.length === 0 ? (
          <EmptyState icon="inbox" title="No users yet" message="Users will appear here once they register." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-navy/[0.04]">
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Phone</th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Orders</th>
                <th className="text-center px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Role</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 text-sm hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center text-navy font-semibold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted">{u.email}</td>
                  <td className="px-4 py-3.5 text-muted">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3.5 text-center text-muted">{u._count.orders}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      u.role === "ADMIN" ? "text-navy bg-navy/5" : "text-muted bg-surface"
                    }`}>
                      {u.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant={u.role === "ADMIN" ? "outlined" : "contained"}
                      onClick={() => toggleRole(u)}
                    >
                      {u.role === "ADMIN" ? "Demote" : "Make Admin"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

const AdminUsersPage = () => <ErrorBoundary><UsersContent /></ErrorBoundary>;
export default AdminUsersPage;

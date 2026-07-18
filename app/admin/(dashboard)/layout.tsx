"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { Menu } from "lucide-react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 lg:p-8 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 mb-4 text-sm font-medium text-navy bg-white border border-border rounded-lg hover:bg-surface transition-colors"
        >
          <Menu className="w-4 h-4" />
          Menu
        </button>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

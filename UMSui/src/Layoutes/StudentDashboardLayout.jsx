import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import StudentDashboardSidebar from "@/Layoutes/Component/StudentDashboardSidebar";
import DashboardHeader from "@/Layoutes/Component/DashboardHeader";
import { useAuth } from "@/Context/AuthContext";

export default function StudentDashboardLayout({ title = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StudentDashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

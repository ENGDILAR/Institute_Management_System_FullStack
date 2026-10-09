import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PenBoxIcon,
  Settings,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const studentMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/student",
  },

  {
    title: "Courses",
    icon: BookOpen,
    path: "/student/courses",
  },
  {
    title: "Subjects",
    icon: ClipboardList,
    path: "/student/subjects",
  },
  {
    title: "My Degrees",
    icon: PenBoxIcon,
    path: "/student/Degrees",
  },
];

export default function studentDashboardSidebar({ open, onClose, onLogout }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-auto  flex-col
          border-r border-sidebar-border bg-sidebar
          transition-transform duration-200
          lg:static lg:inset-y-0 lg:left-0 lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <GraduationCap size={22} />
            </div>

            <div>
              <h1 className="text-sm font-semibold text-sidebar-foreground">
                Institute
              </h1>

              <p className="text-xs text-sidebar-foreground/60">
                Management System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
            Main Menu
          </p>

          <div className="space-y-1">
            {studentMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/student"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 px-3 py-2.5 text-sm
                    transition-colors
                    ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    }
                    `
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />

                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="my-6 border-t border-sidebar-border" />

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
            System
          </p>

          <NavLink
            to="/student/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-2.5 text-sm
              transition-colors
              ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }
              `
            }
          >
            <Settings size={18} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} strokeWidth={1.8} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

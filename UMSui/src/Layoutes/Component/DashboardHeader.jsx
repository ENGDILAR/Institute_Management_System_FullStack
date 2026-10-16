import { Bell, Menu, Moon, Sun, UserCircle } from "lucide-react";

import { useTheme } from "@/Context/ThemeContext";
import { useAuth } from "@/Context/AuthContext";

export default function DashboardHeader({ title, onMenuClick }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-card px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>

        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>

          <p className="hidden text-xs text-muted-foreground sm:block">
            Institute Management System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="ml-2 hidden h-9 w-px bg-border sm:block" />

        <div className="ml-1 flex items-center gap-2">
          <UserCircle
            size={30}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium">
              {user?.email || "Administrator"}
            </p>

            <p className="text-[11px] capitalize text-muted-foreground">
              {user?.role || "Administrator"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

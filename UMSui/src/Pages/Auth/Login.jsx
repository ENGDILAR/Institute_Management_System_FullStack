import {
  BookOpen,
  SunIcon,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  MoonIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import LoginForm from "./authComponent/LoginForm";
import { useTheme } from "@/Context/ThemeContext";

export default function Login() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <main className="relative min-h-screen bg-background p-4 md:p-6">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent"
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <SunIcon className=" h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </button>

      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl md:min-h-[calc(100vh-3rem)] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-60 border-primary-foreground/10" />

          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border-70 border-primary-foreground/10" />

          <div className="absolute right-20 top-32 grid grid-cols-4 gap-3 opacity-20">
            {Array.from({ length: 16 }).map((_, index) => (
              <span
                key={index}
                className="h-2 w-2 rounded-full bg-primary-foreground"
              />
            ))}
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur">
              <GraduationCap size={25} />
            </div>

            <div>
              <h1 className="text-lg font-semibold">Institute</h1>

              <p className="text-xs text-primary-foreground/60">
                Management System
              </p>
            </div>
          </div>

          {/* Main Content */}

          <div className="relative z-10 max-w-lg">
            <Badge
              variant="secondary"
              className="mb-6 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Smart Education Management
            </Badge>

            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
              Everything your institute needs,
              <span className="mt-2 block text-primary-foreground/60">
                in one place.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-primary-foreground/70">
              Manage students, courses, teachers and academic operations through
              one simple and powerful platform.
            </p>

            <div className="mt-10 space-y-5">
              <Feature
                icon={GraduationCap}
                title="Student Management"
                description="Keep student information organized."
              />

              <Feature
                icon={BookOpen}
                title="Course Management"
                description="Manage courses and academic activities."
              />

              <Feature
                icon={ShieldCheck}
                title="Secure Access"
                description="Different access levels for your team."
              />
            </div>
          </div>

          <p className="relative z-10 text-xs text-primary-foreground/50">
            © 2026 Institute Management System
          </p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}

            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
                <GraduationCap size={22} />
              </div>

              <div>
                <h1 className="font-semibold">Institute</h1>

                <p className="text-xs text-muted-foreground">
                  Management System
                </p>
              </div>
            </div>

            <div className="mb-8">
              <Badge variant="outline" className="mb-4">
                Welcome back
              </Badge>

              <h2 className="text-3xl font-bold tracking-tight">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Enter your credentials to continue to your dashboard.
              </p>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-xs text-primary-foreground/50">{description}</p>
      </div>
    </div>
  );
}

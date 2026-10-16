import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import DashboardLoading from "../Student/DashboardLoading";
import { useInstructorDashboard } from "@/Hooks/Instructor/useInstructorDashboard";
import InstructorCoursesTable from "./InstructorCoursesTable";

export default function Instructordashboard() {
  const { dashboard, loading, error } = useInstructorDashboard();

  if (loading) return <DashboardLoading />;

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-card p-6">
        <h2 className="font-semibold">Unable to load dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!dashboard) return null;

  const statistics = [
    {
      title: "Courses",
      value: dashboard.totalCourses,
      description: "Unique courses taught",
      icon: BookOpen,
    },
    {
      title: "Offerings",
      value: dashboard.totalOfferings,
      description: "Course offerings",
      icon: GraduationCap,
    },
    {
      title: "Students",
      value: dashboard.totalStudents,
      description: "Unique students",
      icon: Users,
    },
    {
      title: "Enrollments",
      value: dashboard.totalEnrollments,
      description: "Total enrollments",
      icon: Award,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <p className="text-sm text-muted-foreground">Overview</p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Welcome, {dashboard.instructorName}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review your courses, students, and academic performance.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold">Teaching Statistics</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((item) => (
            <StatItem key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Academic Results</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Student performance across your courses
            </p>
          </div>

          <div className="p-5">
            <AcademicResults dashboard={dashboard} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Teaching Overview</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              A summary of your academic activity
            </p>
          </div>

          <TeachingOverview dashboard={dashboard} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">My Courses</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Students and results for each course offering
          </p>
        </div>

        <InstructorCoursesTable courses={dashboard.courses} />
      </section>
    </div>
  );
}

function StatItem({ icon: Icon, title, value, description }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight">
        {Number(value ?? 0).toLocaleString()}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function AcademicResults({ dashboard }) {
  const successful = Number(dashboard.successfulStudents) || 0;
  const failed = Number(dashboard.failedStudents) || 0;
  const total = successful + failed;

  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">Average Mark</p>

          <p className="mt-2 text-2xl font-semibold">
            {formatAverage(dashboard.average)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              / 100
            </span>
          </p>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">Success Rate</p>

          <p className="mt-2 text-2xl font-semibold">{successRate}%</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Successful students</span>
          <span>{successRate}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
        <ResultItem
          icon={CheckCircle2}
          title="Successful"
          value={successful}
          color="text-emerald-600 dark:text-emerald-400"
        />

        <ResultItem
          icon={XCircle}
          title="Failed"
          value={failed}
          color="text-rose-600 dark:text-rose-400"
        />
      </div>
    </div>
  );
}

function ResultItem({ icon: Icon, title, value, color }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon size={17} className={color} />
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>

      <p className="mt-2 text-2xl font-semibold">
        {Number(value ?? 0).toLocaleString()}
      </p>
    </div>
  );
}

function TeachingOverview({ dashboard }) {
  const items = [
    { title: "Courses", value: dashboard.totalCourses, icon: BookOpen },
    {
      title: "Course Offerings",
      value: dashboard.totalOfferings,
      icon: GraduationCap,
    },
    { title: "Students", value: dashboard.totalStudents, icon: Users },
    {
      title: "Enrollments",
      value: dashboard.totalEnrollments,
      icon: Award,
    },
    {
      title: "Average Mark",
      value: formatAverage(dashboard.average),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="divide-y divide-border px-5">
      {items.map(({ title, value, icon: Icon }) => (
        <div
          key={title}
          className="flex items-center justify-between gap-3 py-4"
        >
          <div className="flex items-center gap-3">
            <Icon
              size={17}
              className="text-muted-foreground"
              strokeWidth={1.8}
            />
            <span className="text-sm">{title}</span>
          </div>

          <span className="text-sm font-semibold">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatAverage(value) {
  const average = Number(value);
  return Number.isFinite(average) ? average.toFixed(2) : "0.00";
}

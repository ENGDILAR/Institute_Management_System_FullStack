import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import DashboardLoading from "../Student/DashboardLoading";
import { useInstructorDashboard } from "@/Hooks/Instructor/useInstructorDashboard";

export default function Instructordashboard() {
  const { dashboard, loading, error } = useInstructorDashboard();

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="border border-border bg-card px-6 py-8 text-center">
          <p className="text-sm font-medium">{error}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <section className="border-b border-border pb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Teaching Overview</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome, {dashboard.instructorName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review your courses, students, and academic performance.
            </p>
          </div>

          <div className="hidden h-11 w-11 shrink-0 items-center justify-center border border-border bg-primary/5 text-primary sm:flex">
            <GraduationCap size={22} strokeWidth={1.7} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Teaching Summary</h2>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
          <StatItem
            icon={BookOpen}
            title="Courses"
            value={dashboard.totalCourses}
            description="Unique courses taught"
          />

          <StatItem
            icon={GraduationCap}
            title="Offerings"
            value={dashboard.totalOfferings}
            description="Course offerings"
          />

          <StatItem
            icon={Users}
            title="Students"
            value={dashboard.totalStudents}
            description="Unique students"
          />

          <StatItem
            icon={Award}
            title="Enrollments"
            value={dashboard.totalEnrollments}
            description="Total enrollments"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Academic Results</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Overall performance of students in your courses.
            </p>
          </div>

          <div className="p-5">
            <AcademicResults dashboard={dashboard} />
          </div>
        </section>

        <section className="border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Teaching Overview</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Summary of your current teaching activity.
            </p>
          </div>

          <TeachingOverview dashboard={dashboard} />
        </section>
      </section>

      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">My Courses</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Student performance across your course offerings.
          </p>
        </div>

        <CoursesTable courses={dashboard.courses} />
      </section>
    </div>
  );
}

function StatItem({ icon: Icon, title, value, description }) {
  return (
    <div className="bg-card px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary/10 text-primary">
          <Icon size={19} strokeWidth={1.8} />
        </div>

        <p className="text-sm font-medium">{title}</p>
      </div>

      <div className="mt-5">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>

        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function AcademicResults({ dashboard }) {
  const completed = dashboard.successfulStudents + dashboard.failedStudents;

  const successRate =
    completed > 0
      ? Math.round((dashboard.successfulStudents / completed) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight">
            {Number(dashboard.average).toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Overall average mark
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">{successRate}%</p>

          <p className="mt-1 text-xs text-muted-foreground">
            student success rate
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{
            width: `${successRate}%`,
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5">
        <ResultItem
          label="Successful"
          value={dashboard.successfulStudents}
          description="Students with 60 or higher"
          icon={CheckCircle2}
        />

        <ResultItem
          label="Failed"
          value={dashboard.failedStudents}
          description="Students below 60"
          icon={XCircle}
        />
      </div>
    </div>
  );
}

function ResultItem({ label, value, description, icon: Icon }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon size={16} strokeWidth={1.8} className="text-muted-foreground" />

        <p className="text-lg font-semibold">{value}</p>
      </div>

      <p className="text-xs font-medium">{label}</p>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function TeachingOverview({ dashboard }) {
  return (
    <div className="divide-y divide-border">
      <OverviewRow
        label="Courses"
        value={dashboard.totalCourses}
        icon={BookOpen}
      />

      <OverviewRow
        label="Course Offerings"
        value={dashboard.totalOfferings}
        icon={GraduationCap}
      />

      <OverviewRow
        label="Students"
        value={dashboard.totalStudents}
        icon={Users}
      />

      <OverviewRow
        label="Enrollments"
        value={dashboard.totalEnrollments}
        icon={Award}
      />

      <OverviewRow
        label="Average Mark"
        value={Number(dashboard.average).toFixed(2)}
        icon={TrendingUp}
      />
    </div>
  );
}

function OverviewRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-3">
        <Icon size={17} strokeWidth={1.8} className="text-muted-foreground" />

        <span className="text-sm">{label}</span>
      </div>

      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function CoursesTable({ courses }) {
  if (!courses?.length) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
        No courses available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-200 text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left">
            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Course
            </th>

            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Offering
            </th>

            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Students
            </th>

            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Completed
            </th>

            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Successful
            </th>

            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Failed
            </th>

            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Average
            </th>
          </tr>
        </thead>

        <tbody>
          {courses.map((course) => (
            <CourseRow key={course.offeringId} course={course} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CourseRow({ course }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-5 py-4">
        <span className="font-medium">{course.courseName}</span>
      </td>

      <td className="px-5 py-4 text-muted-foreground">{course.offerName}</td>

      <td className="px-5 py-4">{course.students}</td>

      <td className="px-5 py-4">{course.completedStudents}</td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <CheckCircle2 size={13} strokeWidth={1.8} />

          {course.successfulStudents}
        </span>
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
          <XCircle size={13} strokeWidth={1.8} />

          {course.failedStudents}
        </span>
      </td>

      <td className="px-5 py-4 font-medium">
        {Number(course.averageMark).toFixed(2)}
      </td>
    </tr>
  );
}

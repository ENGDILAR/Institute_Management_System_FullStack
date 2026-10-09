import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { LoadStudentDashboard } from "@/Services/Student/StudentDashboard";
import DashboardLoading from "./DashboardLoading";

export default function Studentdashboard() {
  const [dashboard, setDashboard] = useState();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const data = await LoadStudentDashboard();

        if (isMounted) {
          setDashboard(data);
        }
      } catch (error) {
        console.error("Error fetching student dashboard:", error);

        if (isMounted) {
          setError("Unable to load your academic information.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

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

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <section className="border-b border-border pb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Academic Overview</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome, {dashboard.studentName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review your courses, academic progress, and examination
              performance.
            </p>
          </div>

          <div className="hidden h-11 w-11 shrink-0 items-center justify-center border border-border bg-primary/5 text-primary sm:flex">
            <GraduationCap size={22} strokeWidth={1.7} />
          </div>
        </div>
      </section>

      {/* Academic Summary */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Academic Summary</h2>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
          <StatItem
            icon={BookOpen}
            title="Courses"
            value={dashboard.totalCourses}
            description="Unique courses taken"
          />

          <StatItem
            icon={CheckCircle2}
            title="Successful"
            value={dashboard.successfulCourses}
            description="Courses successfully completed"
          />

          <StatItem
            icon={Clock3}
            title="Completed Hours"
            value={dashboard.completedHours}
            description="Hours from successful courses"
          />

          <StatItem
            icon={Award}
            title="Average"
            value={`${Number(dashboard.average).toFixed(2)}%`}
            description="Completed courses average"
          />
        </div>
      </section>

      {/* Progress */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Course Progress</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Your current academic progress across enrolled courses.
            </p>
          </div>

          <div className="p-5">
            <CourseProgress
              courses={dashboard.courses}
              totalCourses={dashboard.totalCourses}
            />
          </div>
        </section>

        <section className="border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Academic Standing</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Overview of your completed academic work.
            </p>
          </div>

          <AcademicStanding dashboard={dashboard} />
        </section>
      </section>

      {/* Courses */}
      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">My Courses</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Your courses and their current academic results.
          </p>
        </div>

        <CoursesTable courses={dashboard.courses} />
      </section>

      {/* Exam Performance */}
      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Examination Performance</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Average performance by examination type.
          </p>
        </div>

        <div className="p-5">
          <ExamPerformance data={dashboard.examPerformance} />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                  */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Course Progress                                                             */
/* -------------------------------------------------------------------------- */

function CourseProgress({ courses, totalCourses }) {
  if (!courses.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No courses available.
      </div>
    );
  }

  const completed = courses.filter(
    (course) => course.totalMark !== null && course.totalMark !== undefined,
  ).length;

  const passed = courses.filter((course) => course.isPassed).length;

  const progress =
    totalCourses > 0 ? Math.round((completed / totalCourses) * 100) : 0;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight">{progress}%</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Course completion
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">
            {completed} of {totalCourses}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            courses completed
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5">
        <ProgressItem
          label="Completed"
          value={completed}
          description="With all required marks"
        />

        <ProgressItem
          label="Passed"
          value={passed}
          description="Final mark of 60 or higher"
        />
      </div>
    </div>
  );
}

function ProgressItem({ label, value, description }) {
  return (
    <div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
function AcademicStanding({ dashboard }) {
  const completed = dashboard.courses.filter(
    (course) => course.totalMark !== null && course.totalMark !== undefined,
  ).length;

  const inProgress = dashboard.courses.length - completed;

  return (
    <div className="divide-y divide-border">
      <StandingRow
        label="Overall Average"
        value={`${Number(dashboard.average).toFixed(2)}%`}
        icon={TrendingUp}
      />

      <StandingRow
        label="Successful Courses"
        value={dashboard.successfulCourses}
        icon={CheckCircle2}
      />

      <StandingRow label="In Progress" value={inProgress} icon={Clock3} />

      <StandingRow
        label="Enrollments"
        value={dashboard.totalEnrollments}
        icon={BookOpen}
      />
    </div>
  );
}

function StandingRow({ label, value, icon: Icon }) {
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
  if (!courses.length) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
        No courses available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-162.5 text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left">
            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Course
            </th>

            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Hours
            </th>

            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Total Mark
            </th>

            <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {courses.map((course) => (
            <CourseRow key={course.courseName} course={course} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CourseRow({ course }) {
  const isCompleted =
    course.totalMark !== null && course.totalMark !== undefined;

  let status = "In Progress";
  let statusClass = "bg-muted text-muted-foreground";
  let StatusIcon = Clock3;

  if (isCompleted && course.isPassed) {
    status = "Passed";
    statusClass = "bg-primary/10 text-primary";
    StatusIcon = CheckCircle2;
  } else if (isCompleted && !course.isPassed) {
    status = "Failed";
    statusClass = "bg-destructive/10 text-destructive";
    StatusIcon = XCircle;
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-5 py-4">
        <span className="font-medium">{course.courseName}</span>
      </td>

      <td className="px-5 py-4 text-muted-foreground">{course.hours}</td>

      <td className="px-5 py-4 font-medium">
        {isCompleted ? `${Number(course.totalMark).toFixed(2)}` : "—"}
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${statusClass}`}
        >
          <StatusIcon size={13} strokeWidth={1.8} />

          {status}
        </span>
      </td>
    </tr>
  );
}

function ExamPerformance({ data }) {
  if (!data.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No examination marks available yet.
      </div>
    );
  }

  const maxAverage = Math.max(
    ...data.map((item) => Number(item.average) || 0),
    1,
  );

  return (
    <div className="space-y-5">
      {data.map((item) => {
        const average = Number(item.average) || 0;
        const percentage = Math.min((average / maxAverage) * 100, 100);

        return (
          <div key={item.examType}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{item.examType}</span>

              <span className="text-sm font-semibold">
                {average.toFixed(2)}
              </span>
            </div>

            <div className="h-2 w-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

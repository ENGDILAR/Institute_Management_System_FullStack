import { getCharts, getStatistics } from "@/Services/Admin/AdminDashboard";
import { BookOpen, GraduationCap, Layers3, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Admindashboard() {
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalCourseOfferings: 0,
  });

  const [charts, setCharts] = useState({
    enrollmentsByCourse: [],
    offeringsByStatus: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statisticsData, chartsData] = await Promise.all([
          getStatistics(),
          getCharts(),
        ]);

        setStatistics(statisticsData);
        setCharts(chartsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <p className="text-sm text-muted-foreground">Overview</p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Institute Overview
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          A quick overview of the institute's academic activity and course
          offerings.
        </p>
      </section>
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Academic Statistics</h2>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
          <StatItem
            icon={GraduationCap}
            title="Students"
            value={loading ? "—" : statistics.totalStudents}
            description="Registered students"
          />

          <StatItem
            icon={Users}
            title="Instructors"
            value={loading ? "—" : statistics.totalInstructors}
            description="Registered instructors"
          />

          <StatItem
            icon={BookOpen}
            title="Courses"
            value={loading ? "—" : statistics.totalCourses}
            description="Available courses"
          />

          <StatItem
            icon={Layers3}
            title="Course Offerings"
            value={loading ? "—" : statistics.totalCourseOfferings}
            description="Current offerings"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Course Enrollment</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Number of students enrolled in each course
            </p>
          </div>

          <div className="p-5">
            <EnrollmentOverview
              data={charts.enrollmentsByCourse}
              loading={loading}
            />
          </div>
        </section>
        <section className="border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Course Offerings</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Current status of course offerings
            </p>
          </div>

          <div>
            <OfferingOverview
              data={charts.offeringsByStatus}
              total={statistics.totalCourseOfferings}
              loading={loading}
            />
          </div>
        </section>
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
function EnrollmentOverview({ data, loading }) {
  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Loading enrollment data...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No enrollment data available.
      </div>
    );
  }

  const maxStudents = Math.max(...data.map((course) => course.students), 1);

  return (
    <div className="space-y-5">
      {data.map((course) => {
        const percentage = (course.students / maxStudents) * 100;

        return (
          <div key={course.courseName}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="truncate text-xs font-medium">
                {course.courseName}
              </span>

              <span className="shrink-0 text-xs text-muted-foreground">
                {course.students} students
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

function OfferingOverview({ data, total, loading }) {
  if (loading) {
    return (
      <div className="px-5 py-8 text-center text-sm text-muted-foreground">
        Loading offering data...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="px-5 py-8 text-center text-sm text-muted-foreground">
        No offering data available.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {data.map((item) => {
        const percentage =
          total > 0 ? Math.round((item.count / total) * 100) : 0;

        return (
          <div key={item.status} className="px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.status}</span>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{item.count}</span>

                <span className="text-xs text-muted-foreground">
                  {percentage}%
                </span>
              </div>
            </div>

            <div className="mt-3 h-1.5 w-full bg-muted">
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

import { BookOpen, CheckCircle2, XCircle } from "lucide-react";

export default function InstructorCoursesTable({ courses }) {
  if (!courses?.length) {
    return (
      <div className="px-5 py-10 text-center">
        <BookOpen size={28} className="mx-auto text-muted-foreground" />

        <p className="mt-3 text-sm font-medium">No courses available</p>

        <p className="mt-1 text-xs text-muted-foreground">
          Your courses will appear here when available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-190 text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {[
              "Course",
              "Offering",
              "Students",
              "Completed",
              "Successful",
              "Failed",
              "Average",
            ].map((title) => (
              <th
                key={title}
                className="whitespace-nowrap px-5 py-3 text-xs font-medium text-muted-foreground"
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {courses.map((course) => (
            <tr
              key={course.offeringId}
              className="transition-colors hover:bg-muted/30"
            >
              <td className="px-5 py-4 font-medium">{course.courseName}</td>

              <td className="px-5 py-4 text-muted-foreground">
                {course.offerName}
              </td>

              <td className="px-5 py-4">{course.students}</td>

              <td className="px-5 py-4">{course.completedStudents}</td>

              <td className="px-5 py-4">
                <ResultBadge value={course.successfulStudents} success />
              </td>

              <td className="px-5 py-4">
                <ResultBadge value={course.failedStudents} />
              </td>

              <td className="px-5 py-4 font-semibold">
                {formatAverage(course.averageMark)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultBadge({ value, success = false }) {
  const color = success
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
    : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300";

  const Icon = success ? CheckCircle2 : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}
    >
      <Icon size={13} />
      {Number(value ?? 0).toLocaleString()}
    </span>
  );
}

function formatAverage(value) {
  const average = Number(value);
  return Number.isFinite(average) ? average.toFixed(2) : "0.00";
}

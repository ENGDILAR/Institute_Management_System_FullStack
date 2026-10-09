import { useMemo, useState } from "react";
import { BookOpen, ClipboardList, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useMarks from "@/Hooks/Student/useMarks";

const STATUS_OPTIONS = [
  { value: "All", label: "All Courses" },
  { value: "Open", label: "Open" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Completed", label: "Completed" },
  { value: "Closed", label: "Closed" },
];

export default function ViewMyMarks() {
  const { marks, isLoading, error } = useMarks();

  const [statusFilter, setStatusFilter] = useState("All");

  const courses = useMemo(() => {
    return marks.map((mark) => ({
      enrollmentId: mark.enrollmentId,
      courseOfferingId: mark.courseOfferingId,
      courseName: mark.courseName,
      status: mark.status,
      first: mark.firstExam,
      second: mark.secondExam,
      final: mark.finalExam,
    }));
  }, [marks]);

  const filteredCourses = useMemo(() => {
    if (statusFilter === "All") {
      return courses;
    }

    return courses.filter((course) => course.status === statusFilter);
  }, [courses, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
          <ClipboardList className="size-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Degrees</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View your examination marks for all enrolled courses.
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-75 items-center justify-center border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading your marks...
          </div>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && courses.length === 0 && <EmptyMarks />}

      {/* Results */}
      {!isLoading && !error && courses.length > 0 && (
        <>
          {/* Results Header + Filter */}
          <div className="flex flex-col gap-4 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />

              <span className="text-sm font-medium">Examination Results</span>

              <Badge variant="secondary">
                {filteredCourses.length}{" "}
                {filteredCourses.length === 1 ? "Course" : "Courses"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* No Results After Filter */}
          {filteredCourses.length === 0 ? (
            <div className="flex min-h-55 flex-col items-center justify-center border border-dashed border-border text-center">
              <div className="mb-3 flex size-11 items-center justify-center bg-muted">
                <ClipboardList className="size-5 text-muted-foreground" />
              </div>

              <h2 className="text-base font-semibold">No courses found</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                There are no courses with the selected status.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setStatusFilter("All")}
              >
                Show All Courses
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-hidden border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left font-medium">
                          Course
                        </th>

                        <th className="px-4 py-3 text-center font-medium">
                          Status
                        </th>

                        <th className="px-4 py-3 text-center font-medium">
                          First Exam
                        </th>

                        <th className="px-4 py-3 text-center font-medium">
                          Second Exam
                        </th>

                        <th className="px-4 py-3 text-center font-medium">
                          Final Exam
                        </th>

                        <th className="px-4 py-3 text-center font-medium">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCourses.map((course) => (
                        <DegreeRow key={course.enrollmentId} course={course} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                First Exam: 20 marks · Second Exam: 20 marks · Final Exam: 60
                marks
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function DegreeRow({ course }) {
  const first = getMarkValue(course.first);
  const second = getMarkValue(course.second);
  const final = getMarkValue(course.final);

  const total = (first ?? 0) + (second ?? 0) + (final ?? 0);

  const hasAnyMark = first !== null || second !== null || final !== null;

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-4 font-medium">{course.courseName}</td>

      <td className="px-4 py-4 text-center">
        <StatusBadge status={course.status} />
      </td>

      <td className="px-4 py-4 text-center">
        <MarkValue value={first} max={20} />
      </td>

      <td className="px-4 py-4 text-center">
        <MarkValue value={second} max={20} />
      </td>

      <td className="px-4 py-4 text-center">
        <MarkValue value={final} max={60} />
      </td>

      <td className="px-4 py-4 text-center">
        {hasAnyMark ? (
          <span className="font-semibold">{total}/100</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

function StatusBadge({ status }) {
  const variants = {
    Open: "default",
    Cancelled: "destructive",
    Completed: "secondary",
    Closed: "outline",
  };

  return (
    <Badge variant={variants[status] ?? "outline"}>{status ?? "Unknown"}</Badge>
  );
}

function getMarkValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function MarkValue({ value, max }) {
  if (value === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span>
      {value}/{max}
    </span>
  );
}

function EmptyMarks() {
  return (
    <div className="flex min-h-75 flex-col items-center justify-center border border-dashed border-border text-center">
      <div className="mb-4 flex size-12 items-center justify-center bg-muted">
        <ClipboardList className="size-5 text-muted-foreground" />
      </div>

      <h2 className="text-base font-semibold">No enrolled courses</h2>

      <p className="mt-1 text-sm text-muted-foreground">
        You are not currently enrolled in any courses.
      </p>
    </div>
  );
}

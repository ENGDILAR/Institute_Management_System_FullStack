import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Clock3, Layers3, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import useCourses from "@/Hooks/useCourses";

export default function StudentCourses() {
  const { courses, isLoading, error, fetchCourses } = useCourses();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return courses;
    }

    return courses.filter((course) => {
      const courseName = course.courseName?.toLowerCase() || "";
      const courseId = String(course.courseId || "");

      return courseName.includes(search) || courseId.includes(search);
    });
  }, [courses, searchTerm]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center bg-primary/10 text-primary">
            <BookOpen className="size-5" strokeWidth={1.8} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Academic Catalog
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          Browse the academic courses available at the institute and explore
          their basic information.
        </p>
      </section>

      {/* Toolbar */}
      <section className="flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />

          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search courses..."
            className="h-10 border-border bg-background pl-9 pr-9"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredCourses.length}
            </span>{" "}
            {filteredCourses.length === 1 ? "course" : "courses"}
          </p>
        )}
      </section>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 border border-destructive/40 bg-destructive/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{error}</p>

          <Button variant="outline" size="sm" onClick={fetchCourses}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <CourseSkeleton />
      ) : filteredCourses.length === 0 ? (
        <EmptyState searchTerm={searchTerm} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <article className="group flex min-h-57.5 flex-col border border-border bg-card transition-colors hover:border-primary/40">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex size-11 items-center justify-center bg-primary/10 text-primary">
          <BookOpen className="size-5" strokeWidth={1.8} />
        </div>

        <span className="font-mono text-xs text-muted-foreground">
          #{course.courseId}
        </span>
      </div>

      <div className="flex-1 px-5 pt-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Course
        </p>

        <h2 className="mt-1 line-clamp-2 text-lg font-semibold leading-7 tracking-tight">
          {course.courseName}
        </h2>
      </div>

      <div className="mt-5 border-t border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <CourseMeta
              icon={Clock3}
              value={course.hours}
              label={course.hours === 1 ? "Hour" : "Hours"}
            />

            <CourseMeta
              icon={Layers3}
              value={course.offers ?? 0}
              label={course.offers === 1 ? "Offering" : "Offerings"}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 px-2 text-primary hover:text-primary"
          >
            Details
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function CourseMeta({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-4 text-muted-foreground" strokeWidth={1.8} />

      <span className="text-sm font-medium">{value}</span>

      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-[230px] animate-pulse border border-border bg-muted/30"
        />
      ))}
    </div>
  );
}

function EmptyState({ searchTerm }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center border border-dashed border-border px-6 text-center">
      <div className="flex size-12 items-center justify-center bg-muted text-muted-foreground">
        <BookOpen className="size-6" strokeWidth={1.7} />
      </div>

      <h2 className="mt-4 text-sm font-semibold">
        {searchTerm ? "No courses found" : "No courses available"}
      </h2>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {searchTerm
          ? "Try searching with another course name or ID."
          : "There are currently no academic courses available."}
      </p>
    </div>
  );
}

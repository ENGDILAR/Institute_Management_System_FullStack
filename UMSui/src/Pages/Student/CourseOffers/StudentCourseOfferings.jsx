import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Layers3,
  Search,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import useCourseOfferings from "@/Hooks/useCourseOfferings";

export default function StudentCourseOfferings() {
  const { courseOfferings, isLoading, error, pagination, changePage } =
    useCourseOfferings();

  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredOfferings = useMemo(() => {
    if (!normalizedSearch) return courseOfferings;

    return courseOfferings.filter((offering) => {
      const offerName = offering.offerName?.toLowerCase() ?? "";
      const courseName = offering.courseName?.toLowerCase() ?? "";
      const doctorName = offering.doctorName?.toLowerCase() ?? "";

      return (
        offerName.includes(normalizedSearch) ||
        courseName.includes(normalizedSearch) ||
        doctorName.includes(normalizedSearch)
      );
    });
  }, [courseOfferings, normalizedSearch]);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
          <GraduationCap className="size-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Course Offerings
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Browse available courses and enroll in the offerings you need.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by course, offering, or instructor..."
          className="pl-9 pr-9"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <OfferingsSkeleton />
      ) : filteredOfferings.length === 0 ? (
        <EmptyState searchTerm={searchTerm} />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredOfferings.map((offering) => (
              <OfferingCard key={offering.offerId} offering={offering} />
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={changePage} />
        </>
      )}
    </div>
  );
}

function OfferingCard({ offering }) {
  const capacity = Number(offering.capacity) || 0;
  const enrolled = Number(offering.enrollments) || 0;
  const availableSeats = Math.max(capacity - enrolled, 0);

  const statusText = GetStatusText(offering.status);
  const normalizedStatus = statusText.toLowerCase();

  const isOpen = normalizedStatus === "open";
  const isFull = availableSeats === 0;

  const canEnroll = isOpen && !isFull;

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-border bg-card transition-colors hover:border-primary/30">
      <div className={getStatusBarClass(statusText)} />

      <div className="flex flex-1 flex-col">
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-9 shrink-0 items-center justify-center border border-primary/15 bg-primary/5 text-primary">
                <Layers3 className="size-4" />
              </div>

              <span className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {offering.offerName}
              </span>
            </div>

            <StatusBadge status={statusText} />
          </div>

          <h2 className="line-clamp-2 text-lg font-semibold leading-snug">
            {offering.courseName}
          </h2>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="size-4 shrink-0" />
            <span>{offering.doctorName}</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-auto border-y border-border bg-muted/20">
          <div className="grid grid-cols-3 divide-x divide-border">
            <Stat icon={Users} label="Capacity" value={capacity} />

            <Stat label="Enrolled" value={enrolled} />

            <Stat
              label="Available"
              value={availableSeats}
              valueClassName={
                isFull
                  ? "text-destructive"
                  : "text-emerald-600 dark:text-emerald-400"
              }
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 divide-x divide-border bg-background">
          <DateItem label="Starts" date={offering.startDate} />

          <DateItem label="Ends" date={offering.endDate} />
        </div>

        {/* Enroll */}
        <div className="border-t border-border p-4">
          <Button type="button" className="w-full" disabled={!canEnroll}>
            {isFull ? "Course Full" : isOpen ? "Enroll" : statusText}
          </Button>
        </div>
      </div>
    </article>
  );
}

function Stat({ icon: Icon, label, value, valueClassName = "" }) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        <span>{label}</span>
      </div>

      <span className={`mt-1 text-sm font-semibold ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

function DateItem({ label, date }) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <CalendarDays className="size-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p className="truncate text-sm font-medium">{formattedDate}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusText =
    typeof status === "string" ? status : String(status ?? "Unknown");

  const normalizedStatus = statusText.toLowerCase();

  const styles = {
    open: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",

    closed: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",

    completed:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",

    draft:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",

    cancelled:
      "border-slate-400/30 bg-slate-400/10 text-slate-600 dark:text-slate-400",
  };

  return (
    <Badge
      variant="outline"
      className={`shrink-0 capitalize ${
        styles[normalizedStatus] ??
        "border-border bg-muted text-muted-foreground"
      }`}
    >
      {statusText}
    </Badge>
  );
}

function getStatusBarClass(status) {
  const normalizedStatus =
    typeof status === "string" ? status.toLowerCase() : "";

  const styles = {
    open: "h-1 bg-emerald-500",
    closed: "h-1 bg-red-500",
    completed: "h-1 bg-amber-500",
    draft: "h-1 bg-amber-500",
    cancelled: "h-1 bg-slate-400",
  };

  return styles[normalizedStatus] ?? "h-1 bg-muted";
}

function GetStatusText(state) {
  if (state === 1) return "open";
  if (state === 2) return "closed";
  if (state === 3) return "cancelled";
  if (state === 4) return "Completed";

  return "Unknown";
}

function Pagination({ pagination, onPageChange }) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <p className="text-sm text-muted-foreground">
        Page {pagination.pageNumber} of {pagination.totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.pageNumber - 1)}
        >
          <ChevronLeft className="mr-1 size-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.pageNumber + 1)}
        >
          Next
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}

function OfferingsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-97.5 animate-pulse border border-border bg-muted/20"
        />
      ))}
    </div>
  );
}

function EmptyState({ searchTerm }) {
  return (
    <div className="flex min-h-75 flex-col items-center justify-center border border-dashed border-border text-center">
      <div className="mb-4 flex size-12 items-center justify-center bg-muted">
        <Search className="size-5 text-muted-foreground" />
      </div>

      <h2 className="text-base font-semibold">No course offerings found</h2>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {searchTerm
          ? "Try changing your search terms."
          : "There are currently no course offerings available."}
      </p>
    </div>
  );
}

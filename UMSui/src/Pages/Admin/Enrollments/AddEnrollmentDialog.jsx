import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Search,
  UserPlus,
  Check,
  BookOpen,
  CalendarDays,
  Users,
} from "lucide-react";
import useStudents from "@/Hooks/useStudents";

export default function AddEnrollmentDialog({
  open,
  onOpenChange,
  offer,
  onEnroll,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { students, fetchStudents } = useStudents();
  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open, fetchStudents]);

  const filteredStudents = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) {
      return students;
    }

    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();

      return (
        fullName.includes(value) ||
        student.email?.toLowerCase().includes(value) ||
        String(student.studentID).includes(value)
      );
    });
  }, [students, searchTerm]);
  const handleOpenChange = (value) => {
    onOpenChange(value);

    if (!value) {
      setSearchTerm("");
      setSelectedStudent(null);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !offer) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onEnroll({
        studentId: selectedStudent.studentID,
        courseOfferingId: offer.offerId,
      });

      handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSeats = offer?.capacity ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[70vw] max-w-none overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-xl">
                Add Student to Course
              </DialogTitle>

              <DialogDescription className="mt-1">
                Select a student to enroll in this course offering.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="max-h-[72vh] overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Course information */}
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold">Course Offering</h3>

                <p className="text-xs text-muted-foreground">
                  Information about the selected course offering.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 p-5">
                {/* Course title */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Course
                    </p>

                    <h2 className="mt-1 truncate text-lg font-semibold">
                      {offer?.courseName || "Course Name"}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {offer?.offerName || "Course Offering"}
                    </p>
                  </div>

                  <Badge variant="secondary" className="shrink-0">
                    Offer #{offer?.offerId ?? "—"}
                  </Badge>
                </div>

                {/* Offer details */}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="size-4" />
                      <span className="text-xs font-medium">Instructor</span>
                    </div>

                    <p className="mt-2 truncate text-sm font-medium">
                      {offer?.doctorName || offer?.instructorName || "—"}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="size-4" />
                      <span className="text-xs font-medium">Schedule</span>
                    </div>

                    <p className="mt-2 text-sm font-medium">
                      {offer?.startDate
                        ? new Date(offer.startDate).toLocaleDateString("en-GB")
                        : "—"}

                      {" → "}

                      {offer?.endDate
                        ? new Date(offer.endDate).toLocaleDateString("en-GB")
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="size-4" />
                      <span className="text-xs font-medium">
                        Available Seats
                      </span>
                    </div>

                    <div className="mt-2">
                      <Badge
                        variant={
                          availableSeats > 0 ? "secondary" : "destructive"
                        }
                      >
                        {availableSeats}{" "}
                        {availableSeats === 1 ? "seat" : "seats"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Student selection */}
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold">Select Student</h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Search by student name, ID, or email.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search students..."
                  className="h-10 pl-9"
                  disabled={isSubmitting}
                />
              </div>

              {/* Students */}
              <div className="mt-3 overflow-hidden rounded-xl border">
                <div className="max-h-80 overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    <div className="divide-y">
                      {filteredStudents.map((student) => {
                        const isSelected =
                          selectedStudent?.studentID === student.studentID;

                        const fullName = `${student.firstName} ${student.lastName}`;

                        const initials =
                          `${student.firstName?.[0] ?? ""}${student.lastName?.[0] ?? ""}`.toUpperCase();

                        return (
                          <button
                            key={student.studentID}
                            type="button"
                            onClick={() => setSelectedStudent(student)}
                            disabled={isSubmitting}
                            className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors ${
                              isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                            }`}
                          >
                            <Avatar className="size-10">
                              <AvatarFallback className="text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {fullName}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {student.email}
                              </p>
                            </div>

                            <Badge
                              variant="outline"
                              className="hidden shrink-0 sm:flex"
                            >
                              ID {student.studentID}
                            </Badge>

                            <div
                              className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/30"
                              }`}
                            >
                              {isSelected && <Check className="size-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <Users className="mx-auto mb-3 size-6 text-muted-foreground" />

                      <p className="text-sm font-medium">No students found</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Try searching with another name, ID, or email.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Selected student */}
            {selectedStudent && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <Check className="size-4 text-primary" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    Selected student
                  </p>

                  <p className="truncate text-sm font-medium">
                    {selectedStudent.name}
                  </p>
                </div>

                <Badge variant="secondary">ID {selectedStudent.id}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleEnroll}
            disabled={!selectedStudent || availableSeats <= 0 || isSubmitting}
          >
            {isSubmitting ? "Enrolling..." : "Enroll Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

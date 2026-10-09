import { useEffect, useState } from "react";

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
import { Label } from "@/components/ui/label";

export default function EditCourseDialog({
  course,
  open,
  onOpenChange,
  onConfirm,
}) {
  const [courseName, setCourseName] = useState("");
  const [hours, setHours] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (course) {
      setCourseName(course.courseName || "");
      setHours(course.hours ?? "");
      setValidationError("");
    }
  }, [course]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setValidationError("");

    const trimmedName = courseName.trim();
    const numericHours = Number(hours);

    if (!trimmedName) {
      setValidationError("Course name is required.");
      return;
    }

    if (!hours || numericHours <= 0) {
      setValidationError("Hours must be greater than 0.");
      return;
    }

    try {
      setIsSubmitting(true);

      await onConfirm({
        courseId: course.courseId,
        courseName: trimmedName,
        hours: numericHours,
      });

      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (value) => {
    if (!value) {
      setValidationError("");
    }

    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>

          <DialogDescription>Update the course information.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Course ID */}
          <div className="space-y-2">
            <Label htmlFor="courseId">Course ID</Label>

            <Input id="courseId" value={course?.courseId || ""} disabled />
          </div>

          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="editCourseName">Course Name</Label>

            <Input
              id="editCourseName"
              value={courseName}
              onChange={(event) => setCourseName(event.target.value)}
              placeholder="e.g. Database Systems"
              disabled={isSubmitting}
            />
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <Label htmlFor="editHours">Hours</Label>

            <Input
              id="editHours"
              type="number"
              min="1"
              step="1"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              placeholder="e.g. 3"
              disabled={isSubmitting}
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {validationError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

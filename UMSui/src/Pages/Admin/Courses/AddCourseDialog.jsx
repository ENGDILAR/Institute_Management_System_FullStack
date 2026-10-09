import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Plus } from "lucide-react";

export default function AddCourseDialog({ onAddCourse }) {
  const [open, setOpen] = useState(false);

  const [courseName, setCourseName] = useState("");
  const [hours, setHours] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const resetForm = () => {
    setCourseName("");
    setHours("");
    setValidationError("");
  };

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

      await onAddCourse({
        courseName: trimmedName,
        hours: numericHours,
      });

      resetForm();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (value) => {
    setOpen(value);

    if (!value) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Add Course
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Course</DialogTitle>

          <DialogDescription>
            Add a new academic course to the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name</Label>

            <Input
              id="courseName"
              value={courseName}
              onChange={(event) => setCourseName(event.target.value)}
              placeholder="e.g. Database Systems"
              disabled={isSubmitting}
            />
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <Label htmlFor="hours">Hours</Label>

            <Input
              id="hours"
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
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

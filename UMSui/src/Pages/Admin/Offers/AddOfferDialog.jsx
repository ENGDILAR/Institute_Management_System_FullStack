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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Plus } from "lucide-react";

const emptyForm = {
  offerName: "",
  courseId: "",
  doctorId: "",
  capacity: "",
  status: "1",
  startDate: "",
  endDate: "",
};

export default function AddOfferDialog({ onAddOffer, onFitch }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [validationError, setValidationError] = useState("");
  const [data, setData] = useState({
    courses: [],
    instructors: [],
  });

  const resetForm = () => {
    setForm(emptyForm);
    setValidationError("");
  };

  const handleOpenChange = async (value) => {
    setOpen(value);

    if (!value) {
      resetForm();
      return;
    }

    // Load courses and instructors when dialog opens
    try {
      setIsLoadingData(true);
      setValidationError("");

      const result = await onFitch();

      setData({
        courses: result?.courses ?? [],
        instructors: result?.instructors ?? [],
      });
    } catch (error) {
      console.error("Error loading courses and instructors:", error);

      setValidationError("Failed to load courses and instructors.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    const courseId = Number(form.courseId);
    const doctorId = Number(form.doctorId);
    const capacity = Number(form.capacity);
    const offerName = form.offerName;

    if (!form.courseId || Number.isNaN(courseId) || courseId <= 0) {
      setValidationError("Course is required and must be selected.");
      return;
    }

    if (!form.doctorId || Number.isNaN(doctorId) || doctorId <= 0) {
      setValidationError("Instructor is required and must be selected.");
      return;
    }

    if (!form.capacity || Number.isNaN(capacity) || capacity <= 0) {
      setValidationError("Capacity must be greater than 0.");
      return;
    }

    if (!form.startDate) {
      setValidationError("Start date is required.");
      return;
    }

    if (!form.endDate) {
      setValidationError("End date is required.");
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setValidationError("End date cannot be earlier than start date.");
      return;
    }

    try {
      setIsSubmitting(true);

      await onAddOffer({
        CourseId: courseId,
        InstructorId: doctorId,
        Capacity: capacity,
        Status: Number(form.status),
        StartDate: form.startDate,
        EndDate: form.endDate,
        offerName: form.offerName,
      });

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error creating offer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Add Offer
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Offer</DialogTitle>

          <DialogDescription>
            Create a new course offering for an instructor and course.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="courseId">Course</Label>

              <Select
                value={form.courseId}
                onValueChange={(value) => handleChange("courseId", value)}
                disabled={isSubmitting || isLoadingData}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>

                <SelectContent>
                  {data.courses.map((course) => (
                    <SelectItem
                      key={course.courseID}
                      value={String(course.courseID)}
                    >
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerName">Offer Name</Label>

              <Input
                id="offerName"
                type="text"
                value={form.offerName}
                onChange={(event) =>
                  handleChange("offerName", event.target.value)
                }
                placeholder="e.g. C++ Section 1"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorId">Instructor</Label>

              <Select
                value={form.doctorId}
                onValueChange={(value) => handleChange("doctorId", value)}
                disabled={isSubmitting || isLoadingData}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>

                <SelectContent>
                  {data.instructors.map((instructor) => (
                    <SelectItem
                      key={instructor.instructorID}
                      value={String(instructor.instructorID)}
                    >
                      {instructor.instructorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>

              <Input
                id="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(event) =>
                  handleChange("capacity", event.target.value)
                }
                placeholder="e.g. 30"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>

              <Select
                value={form.status}
                onValueChange={(value) => handleChange("status", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">Open</SelectItem>

                  <SelectItem value="2">Closed</SelectItem>

                  <SelectItem value="3">Cancelled</SelectItem>
                  <SelectItem value="4">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>

              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  handleChange("startDate", event.target.value)
                }
                disabled={isSubmitting}
              />
            </div>
            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>

              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  handleChange("endDate", event.target.value)
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Validation / Loading Error */}
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

            <Button type="submit" disabled={isSubmitting || isLoadingData}>
              {isSubmitting
                ? "Saving..."
                : isLoadingData
                  ? "Loading..."
                  : "Save Offer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

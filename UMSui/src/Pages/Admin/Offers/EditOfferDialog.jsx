import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader2 } from "lucide-react";

const emptyForm = {
  offerName: "",
  courseId: "",
  doctorId: "",
  capacity: "",
  status: "1",
  startDate: "",
  endDate: "",
};

export default function EditOfferDialog({
  offer,
  open,
  onOpenChange,
  onConfirm,
  onFitch,
}) {
  const [form, setForm] = useState(emptyForm);

  const [data, setData] = useState({
    courses: [],
    instructors: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  useEffect(() => {
    if (!open || !offer) return;

    const loadData = async () => {
      try {
        setIsFetchingData(true);

        const result = await onFitch();

        setData({
          courses: result?.courses ?? [],
          instructors: result?.instructors ?? [],
        });

        setForm({
          offerName: offer.offerName != null ? String(offer.offerName) : "",

          courseId: offer.courseId != null ? String(offer.courseId) : "",

          doctorId: offer.doctorId != null ? String(offer.doctorId) : "",

          capacity: offer.capacity != null ? String(offer.capacity) : "",

          status: offer.status != null ? String(offer.status) : "1",

          startDate: offer.startDate
            ? String(offer.startDate).slice(0, 10)
            : "",

          endDate: offer.endDate ? String(offer.endDate).slice(0, 10) : "",
        });
      } catch (error) {
        console.error("Failed to load edit offer data:", error);
      } finally {
        setIsFetchingData(false);
      }
    };

    loadData();
  }, [open, offer, onFitch]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!offer) return;

    const courseId = Number(form.courseId);
    const doctorId = Number(form.doctorId);
    const capacity = Number(form.capacity);
    const status = Number(form.status);

    if (!courseId || courseId <= 0) {
      console.error("Invalid course ID");
      return;
    }

    if (!doctorId || doctorId <= 0) {
      console.error("Invalid instructor ID");
      return;
    }

    if (!capacity || capacity <= 0) {
      console.error("Invalid capacity");
      return;
    }

    if (!form.offerName.trim()) {
      console.error("Offer name is required");
      return;
    }

    const payload = {
      CourseId: courseId,
      OfferName: form.offerName.trim(),
      InstructorId: doctorId,
      Capacity: capacity,
      Status: status,
      StartDate: form.startDate || null,
      EndDate: form.endDate || null,
    };

    console.log("Updating course offering:", {
      id: offer.offerId,
      payload,
    });

    try {
      setIsLoading(true);

      await onConfirm(payload);

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update course offering:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) return;

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Course Offering</DialogTitle>
        </DialogHeader>

        {isFetchingData ? (
          <div className="flex min-h-62.5 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Offer Name */}
            <div className="space-y-2">
              <Label htmlFor="offerName">Offer Name</Label>

              <Input
                id="offerName"
                value={form.offerName}
                onChange={(e) => handleChange("offerName", e.target.value)}
                placeholder="Enter offer name"
                disabled={isLoading}
              />
            </div>

            {/* Course + Instructor */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Course</Label>

                <Select
                  value={form.courseId}
                  onValueChange={(value) => handleChange("courseId", value)}
                  disabled={true}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
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
                <Label>Instructor</Label>

                <Select
                  value={form.doctorId}
                  onValueChange={(value) => handleChange("doctorId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
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
            </div>

            {/* Capacity + Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>

                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>

                <Select
                  value={form.status}
                  onValueChange={(value) => handleChange("status", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="1">Open</SelectItem>

                    <SelectItem value="2">Closed</SelectItem>

                    <SelectItem value="3">Cancelled</SelectItem>
                    <SelectItem value="4">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>

                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>

                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

                {isLoading ? "Updating..." : "Update Offer"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

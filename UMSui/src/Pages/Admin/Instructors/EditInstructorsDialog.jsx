import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EditInstructorsDialog({
  Instructors,
  open,
  onOpenChange,
  onConfirm,
}) {
  const [formData, setFormData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (Instructors) {
      setFormData(Instructors);
    }
  }, [Instructors]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData) return;

    try {
      setIsUpdating(true);

      await onConfirm(formData);

      onOpenChange(false);
      setFormData(null);
    } catch (error) {
      console.error("Error updating Instructors:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (isUpdating) return;

    onOpenChange(false);
    setFormData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Instructors</DialogTitle>

          <DialogDescription>
            Update the Instructors's information below.
          </DialogDescription>
        </DialogHeader>

        {formData && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>

                <Input
                  value={formData.firstName || ""}
                  onChange={(event) =>
                    handleChange("firstName", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>

                <Input
                  value={formData.lastName || ""}
                  onChange={(event) =>
                    handleChange("lastName", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>

              <Input
                type="email"
                value={formData.email || ""}
                onChange={(event) => handleChange("email", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>

              <Input
                value={formData.phone || ""}
                onChange={(event) => handleChange("phone", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Phone</label>

              <Input
                value={formData.ePhone || ""}
                onChange={(event) => handleChange("ePhone", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>

              <Input
                value={formData.address || ""}
                onChange={(event) =>
                  handleChange("address", event.target.value)
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

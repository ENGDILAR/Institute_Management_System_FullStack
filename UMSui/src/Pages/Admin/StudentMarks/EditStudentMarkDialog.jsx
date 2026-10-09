import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import useStudentMarks from "@/Hooks/useStudentMarks";

const examTypeIds = {
  First: 1,
  Second: 2,
  Final: 3,
};

export default function EditStudentMarkDialog({
  open,
  onOpenChange,
  mark,
  onUpdated,
}) {
  const { updateMark } = useStudentMarks();

  const [value, setValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  /*
   * Set the current mark whenever the dialog opens
   * or a different mark is selected.
   */
  useEffect(() => {
    if (!open || !mark) {
      setValue("");
      return;
    }

    setValue(String(mark.mark));
  }, [open, mark]);

  /*
   * Handle mark input.
   */
  const handleValueChange = (newValue) => {
    if (newValue === "") {
      setValue("");
      return;
    }

    /*
     * Allow only numbers and decimal values.
     */
    if (!/^\d*\.?\d*$/.test(newValue)) {
      return;
    }

    /*
     * Maximum mark is 100.
     */
    if (Number(newValue) > 100) {
      return;
    }

    setValue(newValue);
  };

  /*
   * Update the selected mark.
   */
  const handleUpdate = async () => {
    if (!mark || value === "") {
      return;
    }

    const newMark = Number(value);

    /*
     * Nothing changed.
     */
    if (newMark === Number(mark.mark)) {
      onOpenChange(false);
      return;
    }

    const examTypeId = examTypeIds[mark.examType];

    if (!examTypeId) {
      console.error(`Unknown exam type: ${mark.examType}`);
      return;
    }

    setIsUpdating(true);

    try {
      await updateMark({
        EnrollmentId: mark.enrollmentId,
        ExamTypeId: examTypeId,
        Mark: newMark,
      });

      /*
       * Tell the parent that the update was successful.
       */
      if (onUpdated) {
        await onUpdated();
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating student mark:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanged = value !== "" && Number(value) !== Number(mark?.mark);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {mark?.examType} Mark</DialogTitle>
        </DialogHeader>

        {mark && (
          <div className="space-y-5">
            {/* Student Information */}
            <div>
              <div className="font-medium">{mark.studentName}</div>

              <div className="text-sm text-muted-foreground">
                Student ID: {mark.studentId}
              </div>
            </div>

            {/* Mark */}
            <div className="space-y-2">
              <label htmlFor="student-mark" className="text-sm font-medium">
                Mark
              </label>

              <Input
                id="student-mark"
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                disabled={isUpdating}
                autoFocus
              />

              <p className="text-xs text-muted-foreground">
                Enter a mark between 0 and 100.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleUpdate}
                disabled={!hasChanged || isUpdating}
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                {isUpdating ? "Updating..." : "Update Mark"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

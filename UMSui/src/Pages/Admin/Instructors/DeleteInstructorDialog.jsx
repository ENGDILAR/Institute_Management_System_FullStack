import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteInstructorDialog({
  Instructor,
  open,
  onOpenChange,
  onConfirm,
}) {
  const handleDelete = async () => {
    if (!Instructor) return;

    try {
      await onConfirm(Instructor.instructorID);

      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting Instructor:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Instructor?</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete
            <strong>
              {Instructor?.firstName} {Instructor?.lastName}
            </strong>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

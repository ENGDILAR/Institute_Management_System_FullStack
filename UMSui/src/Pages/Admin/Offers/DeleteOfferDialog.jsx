import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DeleteOfferDialog({ offer, open, onOpenChange, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!offer) return;

    try {
      setIsDeleting(true);
      await onConfirm(offer.offerId ?? offer.OfferId ?? offer.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>

            <div>
              <DialogTitle>Delete Offer</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="font-medium">Offer ID: {offer?.offerId ?? offer?.OfferId ?? offer?.id}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Course ID: {offer?.courseId ?? "-"}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this course offering? All related registrations will also be removed.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

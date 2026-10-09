import { useEffect, useState } from "react";

import {
  CalendarDays,
  Clock3,
  GraduationCap,
  Loader2,
  User,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import useCourseOfferings from "@/Hooks/useCourseOfferings";

export default function ViewOffersDialog({ course, open, onOpenChange }) {
  const { getOffersByCourse } = useCourseOfferings();

  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !course?.courseId) {
      return;
    }

    const fetchOffers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getOffersByCourse(course.courseId);

        setOffers(data);
      } catch (error) {
        console.error("Error fetching course offers:", error);

        setError("Unable to load course offers. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [open, course?.courseId]);

  const handleClose = (open) => {
    onOpenChange(open);

    if (!open) {
      setOffers([]);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            {course?.courseName} Offers
          </DialogTitle>

          <DialogDescription>
            View all course offerings for this course.
          </DialogDescription>
        </DialogHeader>

        {/* Course Information */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Course ID</p>

            <p className="font-semibold">{course?.courseId}</p>
          </div>

          <Badge variant="secondary">
            {offers.length} {offers.length === 1 ? "Offer" : "Offers"}
          </Badge>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading offers...
            </div>
          </div>
        ) : offers.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <GraduationCap className="mb-4 size-10 text-muted-foreground" />

            <h3 className="font-semibold">No offers available</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              There are no offerings for this course yet.
            </p>
          </div>
        ) : (
          <div className="max-h-112.5 space-y-3 overflow-y-auto pr-1">
            {offers.map((item) => {
              const offer = item.offer;

              return (
                <div
                  key={offer.offerId}
                  className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{offer.offerName}</h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Offer ID: {offer.offerId}
                      </p>
                    </div>

                    <Badge
                      variant={
                        offer.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {offer.status}
                    </Badge>
                  </div>

                  {/* Information */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="size-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Instructor
                        </p>

                        <p className="font-medium">{offer.doctorName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="size-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Enrollment
                        </p>

                        <p className="font-medium">
                          {item.enrollmentCount} / {offer.capacity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="size-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Start Date
                        </p>

                        <p className="font-medium">
                          {new Date(offer.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock3 className="size-4 text-muted-foreground" />

                      <div>
                        <p className="text-xs text-muted-foreground">
                          End Date
                        </p>

                        <p className="font-medium">
                          {new Date(offer.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Progress */}
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Enrollment capacity</span>

                      <span>
                        {item.enrollmentCount} / {offer.capacity}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(
                            (item.enrollmentCount / offer.capacity) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

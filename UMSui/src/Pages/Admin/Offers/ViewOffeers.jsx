import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList } from "lucide-react";
import OfferStudentsMarksDialog from "@/Pages/Admin/StudentMarks/OfferStudentsMarksDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  CalendarRange,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddOfferDialog from "./AddOfferDialog";
import EditOfferDialog from "./EditOfferDialog";
import DeleteOfferDialog from "./DeleteOfferDialog";
import useCourseOfferings from "@/Hooks/useCourseOfferings";

import useEnrollments from "@/Hooks/useEnrollments";
import AddEnrollmentDialog from "../Enrollments/AddEnrollmentDialog";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ViewOffers() {
  const {
    courseOfferings,
    isLoading,
    error,
    pagination,
    getCourseOffering,
    addNewCourseOffering,
    updateExistingCourseOffering,
    deleteExistingCourseOffering,
    changePage,
    GetIns_Cours_Data,
    fetchCourseOfferings,
  } = useCourseOfferings();
  const { addNewEnrollment } = useEnrollments();
  const [selectedOfferForMarks, setSelectedOfferForMarks] = useState(null);

  const [isMarksOpen, setIsMarksOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const offers = Array.isArray(courseOfferings)
    ? courseOfferings
    : (courseOfferings?.data ?? []);

  const filteredOffers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return offers;

    return offers.filter((offer) => {
      const courseName = String(offer.courseName ?? "").toLowerCase();
      const offerName = String(offer.offerName ?? "").toLowerCase();

      return courseName.includes(term) || offerName.includes(term);
    });
  }, [offers, searchTerm]);
  const handleEdit = async (offerId) => {
    try {
      const response = await getCourseOffering(offerId);
      const offer = response?.offer ?? response;
      setEditingOffer(offer);
      setIsEditOpen(true);
    } catch (error) {
      console.error("Error loading offer:", error);
    }
  };
  function get_status(num) {
    if (num === 1) return "Open";

    if (num === 2) return "Closed";

    if (num === 3) return "Cancelled";
    if (num === 4) return "Completed";
  }
  const handleUpdate = async (offerPayload) => {
    if (!editingOffer) return;

    try {
      await updateExistingCourseOffering(editingOffer.offerId, {
        ...offerPayload,
        CourseId: Number(offerPayload.CourseId),
        InstructorId: Number(offerPayload.InstructorId),
        Capacity: Number(offerPayload.Capacity),
        Status: Number(offerPayload.Status),
      });

      setEditingOffer(null);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update offer:", error);
    }
  };

  const handleDelete = async (offerId) => {
    await deleteExistingCourseOffering(offerId);
    setDeletingOffer(null);
  };
  const handleEnrollment = async (enrollmentData) => {
    await addNewEnrollment(enrollmentData);

    await fetchCourseOfferings();
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Course Offerings
          </h1>
          <p className="text-muted-foreground">
            Manage all course offerings, capacities, and schedules.
          </p>
        </div>

        <AddOfferDialog
          onFitch={GetIns_Cours_Data}
          onAddOffer={addNewCourseOffering}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by offer Name ,course Name.."
            className="pl-9 pr-9"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Badge variant="secondary" className="w-fit px-3 py-1.5">
          <CalendarRange className="mr-2 size-4" />
          {filteredOffers.length}{" "}
          {filteredOffers.length === 1 ? "Offer" : "Offers"}
        </Badge>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-lg border bg-muted/50"
            />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <CalendarRange className="mb-4 size-10 text-muted-foreground" />
          <h3 className="font-semibold">
            {searchTerm ? "No offers found" : "No offers yet"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? "Try changing your filters."
              : "Add your first course offering."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer ID</TableHead>
                <TableHead>Offer Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Instructor Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow key={offer.offerId}>
                  <TableCell>{offer.offerId}</TableCell>
                  <TableCell>{offer.offerName}</TableCell>
                  <TableCell>{offer.courseName}</TableCell>
                  <TableCell>{offer.doctorName}</TableCell>
                  <TableCell>{offer.capacity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        offer.status === 1
                          ? "default"
                          : offer.status === 2
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {get_status(offer.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(offer.startDate)}</TableCell>
                  <TableCell>{formatDate(offer.endDate)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Open actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="w-48 sm:w-56 md:w-64"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEdit(offer.offerId)}
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            setDeletingOffer(offer);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={offer.status !== 1}
                          onClick={() => {
                            setSelectedOffer(offer);
                            setIsEnrollmentOpen(true);
                          }}
                        >
                          <UserPlus className="mr-2 size-4" />
                          Add New Enrollment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOfferForMarks(offer);
                            setIsMarksOpen(true);
                          }}
                        >
                          <GraduationCap className="mr-2 size-4" />
                          Students & Marks
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!pagination.hasPreviousPage}
            onClick={() => changePage(Math.max(1, pagination.pageNumber - 1))}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {pagination.pageNumber} / {pagination.totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => changePage(pagination.pageNumber + 1)}
          >
            Next
          </Button>
        </div>
      )}
      <OfferStudentsMarksDialog
        offer={selectedOfferForMarks}
        open={isMarksOpen}
        onOpenChange={(open) => {
          setIsMarksOpen(open);

          if (!open) {
            setSelectedOfferForMarks(null);
          }
        }}
      />
      <EditOfferDialog
        offer={editingOffer}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleUpdate}
        onFitch={GetIns_Cours_Data}
      />

      <DeleteOfferDialog
        offer={deletingOffer}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
      />
      <AddEnrollmentDialog
        open={isEnrollmentOpen}
        onOpenChange={setIsEnrollmentOpen}
        offer={selectedOffer}
        onEnroll={handleEnrollment}
      />
    </div>
  );
}

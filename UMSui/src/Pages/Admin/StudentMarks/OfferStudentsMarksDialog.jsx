import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Save,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import useStudentMarks from "@/Hooks/useStudentMarks";
import EditStudentMarkDialog from "@/Pages/Admin/StudentMarks/EditStudentMarkDialog";

const examTypeIds = {
  First: 1,
  Second: 2,
  Final: 3,
};
export default function OfferStudentsMarksDialog({
  offer,
  open,
  onOpenChange,
}) {
  const {
    marks,
    pagination,
    isLoading,
    error,
    fetchMarksByCourseOffering,
    addMarksForCourseOffering,
  } = useStudentMarks();

  const [search, setSearch] = useState("");
  const [examType, setExamType] = useState("First");

  const [editedMarks, setEditedMarks] = useState({});

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMark, setSelectedMark] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !offer?.offerId) {
      return;
    }

    setSearch("");
    setExamType("First");
    setEditedMarks({});
    setEditDialogOpen(false);
    setSelectedMark(null);

    fetchMarksByCourseOffering(offer.offerId, 1, 20);
  }, [open, offer?.offerId, fetchMarksByCourseOffering]);

  const students = useMemo(() => {
    return (marks ?? []).map((mark) => {
      const first = Number(mark.firstExam ?? 0);
      const second = Number(mark.secondExam ?? 0);
      const final = Number(mark.finalExam ?? 0);

      return {
        enrollmentId: mark.enrollmentId,

        studentId: mark.studnetId,

        studentName: mark.studentName ?? `Student #${mark.studnetId}`,

        first: mark.firstExam,
        second: mark.secondExam,
        final: mark.finalExam,

        total: first + second + final,
      };
    });
  }, [marks]);

  const filteredStudents = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return students;
    }

    return students.filter(
      (student) =>
        student.studentName.toLowerCase().includes(value) ||
        String(student.studentId).includes(value),
    );
  }, [students, search]);

  const getExamMark = (student, type) => {
    if (type === "First") {
      return student.first;
    }

    if (type === "Second") {
      return student.second;
    }

    return student.final;
  };
  const hasExistingMark = (student, type) => {
    const mark = getExamMark(student, type);

    return mark !== null && mark !== undefined;
  };
  const getInputValue = (student) => {
    const enrollmentId = student.enrollmentId;

    if (Object.prototype.hasOwnProperty.call(editedMarks, enrollmentId)) {
      return editedMarks[enrollmentId];
    }

    return getExamMark(student, examType) ?? "";
  };
  const handleMarkChange = (enrollmentId, value) => {
    if (value === "") {
      setEditedMarks((previous) => ({
        ...previous,
        [enrollmentId]: "",
      }));

      return;
    }

    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    if (Number(value) > 100) {
      return;
    }

    setEditedMarks((previous) => ({
      ...previous,
      [enrollmentId]: value,
    }));
  };

  const handleOpenEdit = (student, type) => {
    const mark = getExamMark(student, type);

    /*
     * Do not open the edit dialog
     * if the mark does not exist.
     */
    if (mark === null || mark === undefined) {
      return;
    }

    setSelectedMark({
      enrollmentId: student.enrollmentId,
      studentId: student.studentId,
      studentName: student.studentName,
      examType: type,
      mark,
    });

    setEditDialogOpen(true);
  };

  const handleMarkUpdated = async () => {
    if (!offer?.offerId) {
      return;
    }
    await fetchMarksByCourseOffering(
      offer.offerId,
      pagination.pageNumber,
      pagination.pageSiz,
    );

    setSelectedMark(null);
  };

  const hasChanges = students.some((student) => {
    if (
      !Object.prototype.hasOwnProperty.call(editedMarks, student.enrollmentId)
    ) {
      return false;
    }

    return editedMarks[student.enrollmentId] !== "";
  });
  const handleSaveMarks = async () => {
    if (!offer?.offerId || !hasChanges) {
      return;
    }

    const selectedExamTypeId = examTypeIds[examType];

    const marksToSave = students
      .filter(
        (student) =>
          Object.prototype.hasOwnProperty.call(
            editedMarks,
            student.enrollmentId,
          ) && editedMarks[student.enrollmentId] !== "",
      )
      .map((student) => ({
        EnrollmentId: student.enrollmentId,

        Mark: Number(editedMarks[student.enrollmentId]),
      }));

    if (marksToSave.length === 0) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await addMarksForCourseOffering({
        CourseOfferingId: offer.offerId,

        ExamTypeId: selectedExamTypeId,

        Marks: marksToSave,
      });

      console.log("Marks save response:", response);

      setEditedMarks({});

      await fetchMarksByCourseOffering(
        offer.offerId,
        pagination.pageNumber,
        pagination.pageSiz,
      );
    } catch (error) {
      console.error("Error saving student marks:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.pageNumber <= 1 || !offer?.offerId) {
      return;
    }

    setEditedMarks({});

    fetchMarksByCourseOffering(
      offer.offerId,
      pagination.pageNumber - 1,
      pagination.pageSiz,
    );
  };

  const handleNextPage = () => {
    if (pagination.pageNumber >= pagination.totalPages || !offer?.offerId) {
      return;
    }

    setEditedMarks({});

    fetchMarksByCourseOffering(
      offer.offerId,
      pagination.pageNumber + 1,
      pagination.pageSiz,
    );
  };

  const hasPagination = pagination.totalPages > 1;

  const renderExamCell = (student, type) => {
    const existing = hasExistingMark(student, type);

    const mark = getExamMark(student, type);

    if (type !== examType) {
      return <span>{mark ?? "-"}</span>;
    }

    if (existing) {
      return (
        <div className="flex items-center justify-center gap-2">
          <span className="font-medium">{mark}</span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleOpenEdit(student, type)}
            disabled={isSaving}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    /*
     * Missing mark:
     * Show input so the admin can add it.
     */
    return (
      <Input
        type="text"
        inputMode="decimal"
        value={getInputValue(student)}
        onChange={(e) => handleMarkChange(student.enrollmentId, e.target.value)}
        placeholder="—"
        className="mx-auto h-9 w-20 text-center"
        disabled={isSaving}
      />
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[85vh] max-w-5xl flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{offer?.offerName} - Students & Marks</DialogTitle>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student by name or ID..."
                  className="pl-9"
                />
              </div>

              <select
                value={examType}
                onChange={(e) => {
                  setExamType(e.target.value);

                  setEditedMarks({});
                }}
                disabled={isSaving}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="First">First Exam</option>

                <option value="Second">Second Exam</option>

                <option value="Final">Final Exam</option>
              </select>
            </div>

            {error && (
              <div className="shrink-0 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex min-h-0 flex-1 items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="flex min-h-0 flex-1 items-center justify-center py-10 text-muted-foreground">
                No students enrolled in this course offering.
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-auto rounded-md border">
                  <table className="w-full min-w-200">
                    <thead className="sticky top-0 z-10 bg-muted">
                      <tr className="border-b">
                        <th className="p-3 text-left">Student</th>

                        <th className="p-3 text-center">First</th>

                        <th className="p-3 text-center">Second</th>

                        <th className="p-3 text-center">Final</th>

                        <th className="p-3 text-center">Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-sm text-muted-foreground"
                          >
                            No students match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr
                            key={student.enrollmentId}
                            className="border-b last:border-0"
                          >
                            <td className="p-3">
                              <div className="font-medium">
                                {student.studentName}
                              </div>

                              <div className="text-xs text-muted-foreground">
                                ID: {student.studentId}
                              </div>
                            </td>

                            <td className="p-2 text-center">
                              {renderExamCell(student, "First")}
                            </td>

                            <td className="p-2 text-center">
                              {renderExamCell(student, "Second")}
                            </td>

                            <td className="p-2 text-center">
                              {renderExamCell(student, "Final")}
                            </td>

                            <td className="p-3 text-center font-medium">
                              {student.total}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex shrink-0 flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing page {pagination.pageNumber} of{" "}
                    {pagination.totalPages}
                    {pagination.totalEnrollments} students
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleSaveMarks}
                      disabled={!hasChanges || isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}

                      {isSaving ? "Saving..." : "Save Marks"}
                    </Button>
                    {hasPagination && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            isLoading || isSaving || pagination.pageNumber <= 1
                          }
                          onClick={handlePreviousPage}
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          Previous
                        </Button>

                        <span className="min-w-16 text-center text-sm">
                          {pagination.pageNumber} / {pagination.totalPages}
                        </span>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            isLoading ||
                            isSaving ||
                            pagination.pageNumber >= pagination.totalPages
                          }
                          onClick={handleNextPage}
                        >
                          Next
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EditStudentMarkDialog
        open={editDialogOpen}
        onOpenChange={(isOpen) => {
          setEditDialogOpen(isOpen);

          if (!isOpen) {
            setSelectedMark(null);
          }
        }}
        mark={selectedMark}
        onUpdated={handleMarkUpdated}
      />
    </>
  );
}

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Search,
  Users,
  X,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import AddStudentDialog from "./AddStudentDialog";
import EditStudentDialog from "./EditStudentDialog";
import DeleteStudentDialog from "./DeleteStudentDialog";

import useStudents from "@/Hooks/useStudents";

export default function ViewStudents() {
  const {
    students,
    isLoading,
    error,
    getStudent,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useStudents();

  const [searchTerm, setSearchTerm] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return students;
    }

    return students.filter((student) => {
      const firstName = student.firstName?.toLowerCase() || "";
      const lastName = student.lastName?.toLowerCase() || "";
      const email = student.email?.toLowerCase() || "";

      return (
        firstName.includes(search) ||
        lastName.includes(search) ||
        email.includes(search)
      );
    });
  }, [students, searchTerm]);

  const handleEdit = async (studentId) => {
    try {
      const student = await getStudent(studentId);

      setEditingStudent(student);
      setIsEditOpen(true);
    } catch (error) {
      console.error("Error getting student:", error);
    }
  };

  const handleUpdate = async (studentData) => {
    await updateStudent(studentData.studentID, studentData);

    setEditingStudent(null);
  };

  const openDeleteDialog = (student) => {
    setDeletingStudent(student);
    setIsDeleteOpen(true);
  };

  const handleDelete = async (studentId) => {
    await deleteStudent(studentId);

    setDeletingStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>

          <p className="text-muted-foreground">
            Manage students and their information.
          </p>
        </div>

        <AddStudentDialog onAddStudent={addStudent} />
      </div>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or email..."
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className=" size-10" />
            </button>
          )}
        </div>

        <Badge variant="secondary" className="w-fit px-3 py-1.5">
          <Users className="mr-1.5 size-4" />
          {filteredStudents.length}{" "}
          {filteredStudents.length === 1 ? "Student" : "Students"}
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
        <div className="overflow-hidden rounded-lg border">
          <div className="hidden md:block">
            <div className="h-12 animate-pulse bg-muted" />

            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 border-t animate-pulse bg-muted/50"
              />
            ))}
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Users className="mb-4 size-10 text-muted-foreground" />

          <h3 className="font-semibold">
            {searchTerm ? "No students found" : "No students yet"}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? "Try changing your search."
              : "Add your first student to get started."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-lg border md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left font-medium">Student</th>

                    <th className="h-12 px-4 text-left font-medium">Email</th>

                    <th className="h-12 px-4 text-left font-medium">Phone</th>

                    <th className="h-12 px-4 text-left font-medium">Address</th>

                    <th className="h-12 px-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.studentID}
                      className="border-b transition-colors hover:bg-muted/50 last:border-b-0"
                    >
                      {/* Student */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            {student.firstName?.charAt(0).toUpperCase()}
                            {student.lastName?.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium">
                              {student.firstName} {student.lastName}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              ID: {student.studentID}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-4" />

                          <span>{student.email}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-4" />

                          <span>{student.phone || "—"}</span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="max-w-48 p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="size-4 shrink-0" />

                          <span className="truncate">
                            {student.address || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student.studentID)}
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(student)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredStudents.map((student) => (
              <div key={student.studentID} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {student.firstName?.charAt(0).toUpperCase()}
                      {student.lastName?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium">
                        {student.firstName} {student.lastName}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        ID: {student.studentID}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4 shrink-0" />
                    <span>{student.phone || "—"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    <span>{student.address || "—"}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(student.studentID)}
                  >
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDeleteDialog(student)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Student */}
      <EditStudentDialog
        student={editingStudent}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleUpdate}
      />

      <DeleteStudentDialog
        student={deletingStudent}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}

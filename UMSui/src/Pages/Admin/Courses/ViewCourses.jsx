import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  BookOpen,
  Clock3,
  Pencil,
  Search,
  Trash2,
  X,
  GraduationCap,
  ChartAreaIcon,
} from "lucide-react";
import ViewOffersDialog from "./ViewOffersDialog";
import AddCourseDialog from "./AddCourseDialog";
import EditCourseDialog from "./EditCourseDialog";
import DeleteCourseDialog from "./DeleteCourseDialog";

import useCourses from "@/Hooks/useCourses";
import useCourseOfferings from "@/Hooks/useCourseOfferings";

export default function ViewSubjects() {
  const {
    courses,
    isLoading,
    error,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse,
  } = useCourses();
  const {} = useCourseOfferings();

  const [searchTerm, setSearchTerm] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const filteredCourses = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return courses;
    }

    return courses.filter((course) => {
      const courseName = course.courseName?.toLowerCase() || "";
      const courseId = String(course.courseId || "");

      return courseName.includes(search) || courseId.includes(search);
    });
  }, [courses, searchTerm]);

  const handleEdit = async (courseId) => {
    try {
      const course = await getCourse(courseId);

      setEditingCourse(course);
      setIsEditOpen(true);
    } catch (error) {
      console.error("Error getting course:", error);
    }
  };

  const handleUpdate = async (courseData) => {
    await updateCourse(courseData.courseId, courseData);

    setEditingCourse(null);
  };

  const openDeleteDialog = (course) => {
    setDeletingCourse(course);
    setIsDeleteOpen(true);
  };

  const handleDelete = async (courseId) => {
    await deleteCourse(courseId);

    setDeletingCourse(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>

          <p className="text-muted-foreground">
            Manage academic courses and their information.
          </p>
        </div>

        <AddCourseDialog onAddCourse={addCourse} />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by course name or ID..."
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
          <BookOpen className="mr-1.5 size-4" />
          {filteredCourses.length}{" "}
          {filteredCourses.length === 1 ? "Course" : "Courses"}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-xl border bg-muted/50"
            />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <BookOpen className="mb-4 size-10 text-muted-foreground" />

          <h3 className="font-semibold">
            {searchTerm ? "No courses found" : "No courses yet"}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? "Try changing your search."
              : "Add your first course to get started."}
          </p>
        </div>
      ) : (
        /* Courses Grid */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.courseId}
              className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="size-6" />
                </div>

                <Badge variant="outline">Subject</Badge>
              </div>
              <div className="mt-5">
                <h2 className="line-clamp-2 text-lg font-semibold">
                  {course.courseName}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Course ID: {course.courseId}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2 text-1 text-blue-500  ">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedCourse(course);
                    setIsOffersOpen(true);
                  }}
                >
                  <ChartAreaIcon className="size-4" />

                  <span>
                    {course.offers} {course.offers === 1 ? "Offer" : "Offers"}
                  </span>
                </Button>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="size-4" />

                <span>
                  {course.hours} {course.hours === 1 ? "Hour" : "Hours"}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(course.courseId)}
                >
                  <Pencil className="mr-2 size-4" />
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => openDeleteDialog(course)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditCourseDialog
        course={editingCourse}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleUpdate}
      />

      <DeleteCourseDialog
        course={deletingCourse}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
      />
      <ViewOffersDialog
        course={selectedCourse}
        open={isOffersOpen}
        onOpenChange={(open) => {
          setIsOffersOpen(open);

          if (!open) {
            setSelectedCourse(null);
          }
        }}
      />
    </div>
  );
}

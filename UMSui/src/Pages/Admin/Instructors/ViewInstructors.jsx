import {
  MoreHorizontal,
  Plus,
  Search,
  Mail,
  Phone,
  BookOpen,
  Users,
  Trash2,
  Edit,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useInstructor from "@/Hooks/useInstructor";
import { useMemo, useState } from "react";
import AddInstructorDialog from "./AddInstructorDialog";
import DeleteInstructorDialog from "./DeleteInstructorDialog";
import EditInstructorsDialog from "./EditInstructorsDialog";

export default function ViewInstructors() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    instructors,
    isLoading,
    error,

    fetchInstructors,
    getInstructor,
    addNewInstructor,
    updateExistingInstructor,
    deleteExistingInstructor,
  } = useInstructor();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingInstructors, setEditingInstructors] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingInstructors, setDeletingInstructors] = useState(null);

  const filteredInstructors = useMemo(() => {
    const search = searchTerm.toLowerCase();
    if (!search) return instructors;

    return instructors.filter((inst) => {
      const firstName = inst.firstName?.toLowerCase() || "";
      const lastName = inst.lastName?.toLowerCase() || "";
      const email = inst.email?.toLowerCase() || "";

      return (
        firstName.includes(search) ||
        lastName.includes(search) ||
        email.includes(search)
      );
    });
  }, [instructors, searchTerm]);

  const openDeleteDialog = (instructor) => {
    setDeletingInstructors(instructor);
    setIsDeleteOpen(true);
  };
  const handleDelete = async (instructorId) => {
    await deleteExistingInstructor(instructorId);

    setDeletingInstructors(null);
  };

  const openEditeDialog = async (instructor) => {
    setEditingInstructors(instructor);
    setIsEditOpen(true);
  };

  const handleEdite = async (instructorData) => {
    await updateExistingInstructor(instructorData.instructorID, instructorData);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Instructors</h1>

          <p className="text-sm text-muted-foreground">
            Manage instructors and their academic information.
          </p>
        </div>

        <AddInstructorDialog onAddInstructor={addNewInstructor} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Instructors</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                View and manage all instructors.
              </p>
            </div>
          </div>
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search instructors..."
              className="pl-9 w-1/3"
            />
            <div className="relative w-full sm:w-72">
              <Badge variant="secondary" className="w-fit px-3 py-1.5">
                <Users className="mr-1.5 size-4" />
                {filteredInstructors.length}
                {filteredInstructors.length === 1
                  ? " Instructor"
                  : " Instructors"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>

                  <TableHead>Contact</TableHead>

                  <TableHead>Address</TableHead>

                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredInstructors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No instructors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstructors.map((instructor) => {
                    const initials = `${instructor.firstName[0]}${instructor.lastName[0]}`;

                    return (
                      <TableRow key={instructor.instructorID}>
                        {/* Instructor */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={instructor.image}
                                alt={`${instructor.firstName} ${instructor.lastName}`}
                              />

                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col">
                              <span className="font-medium">
                                {instructor.firstName} {instructor.lastName}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {instructor.email}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {instructor.phone}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{instructor.address}</TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />

                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-primary"
                                onSelect={() => {
                                  openEditeDialog(instructor);
                                }}
                              >
                                Edit Instructor
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => openDeleteDialog(instructor)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {
        <DeleteInstructorDialog
          Instructor={deletingInstructors}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={() => handleDelete(deletingInstructors.instructorID)}
        />
      }
      {
        <EditInstructorsDialog
          Instructors={editingInstructors}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onConfirm={handleEdite}
        />
      }
    </div>
  );
}

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialInstructor = {
  firstName: "",
  lastName: "",
  address: "",
  phone: "",
  email: "",
  password: "",
  ePhone: "",
};

export default function AddInstructorDialog({ onAddInstructor }) {
  const [open, setOpen] = useState(false);
  const [instructor, setInstructor] = useState(initialInstructor);
  const [isAdding, setIsAdding] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setInstructor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setInstructor(initialInstructor);
  };

  const handleOpenChange = (value) => {
    setOpen(value);

    if (!value && !isAdding) {
      resetForm();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsAdding(true);

      await onAddInstructor(instructor);

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error adding instructor:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Instructor
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Instructor</DialogTitle>

          <DialogDescription>
            Enter the instructor's information to register a new instructor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>

              <Input
                id="firstName"
                name="firstName"
                value={instructor.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>

              <Input
                id="lastName"
                name="lastName"
                value={instructor.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                name="email"
                type="email"
                value={instructor.email}
                onChange={handleChange}
                placeholder="instructor@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>

              <Input
                id="phone"
                name="phone"
                value={instructor.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ePhone">Emergency Phone</Label>

              <Input
                id="ePhone"
                name="ePhone"
                value={instructor.ePhone}
                onChange={handleChange}
                placeholder="Emergency phone"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                name="password"
                type="password"
                value={instructor.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>

              <Input
                id="address"
                name="address"
                value={instructor.address}
                onChange={handleChange}
                placeholder="Instructor address"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isAdding}>
              {isAdding ? "Adding..." : "Add Instructor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

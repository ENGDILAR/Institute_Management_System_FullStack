import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  addInstructor,
  deleteInstructor,
  getAllInstructors,
  getInstructorByID,
  updateInstructor,
} from "@/Services/Admin/ManageInstructors";

export default function useInstructor() {
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllInstructors();

      setInstructors(data);
      console.log("Fetched instructors:", data);
    } catch (error) {
      console.error("Error fetching instructors:", error);

      setError("Unable to load instructors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const getInstructor = async (instructorId) => {
    return await getInstructorByID(instructorId);
  };

  const addNewInstructor = async (instructorData) => {
    try {
      await addInstructor(instructorData);

      toast.success("Instructor added successfully.");

      await fetchInstructors();
    } catch (error) {
      console.error("Error adding instructor:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while adding the instructor.");
      }

      throw error;
    }
  };

  const updateExistingInstructor = async (instructorId, instructorData) => {
    try {
      await updateInstructor(instructorId, instructorData);

      toast.success("Instructor updated successfully.");

      await fetchInstructors();
    } catch (error) {
      console.error("Error updating instructor:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while updating the instructor.");
      }

      throw error;
    }
  };

  const deleteExistingInstructor = async (instructorId) => {
    try {
      await deleteInstructor(instructorId);

      toast.success("Instructor deleted successfully.");

      await fetchInstructors();
    } catch (error) {
      console.error("Error deleting instructor:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while deleting the instructor.");
      }

      throw error;
    }
  };

  return {
    instructors,
    isLoading,
    error,

    fetchInstructors,
    getInstructor,
    addNewInstructor,
    updateExistingInstructor,
    deleteExistingInstructor,
  };
}

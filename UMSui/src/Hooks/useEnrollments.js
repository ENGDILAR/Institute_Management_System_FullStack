import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  addEnrollment,
  deleteEnrollmentByID,
  getEnrollmentByID,
  getEnrollmentsByOfferID,
  getEnrollmentsByStudentID,
} from "@/Services/Admin/ManageEnrollments";

export default function useEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = useCallback(async (courseOfferId) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getEnrollmentsByOfferID(courseOfferId);

      setEnrollments(data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);

      setError("Unable to load enrollments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStudentEnrollments = useCallback(async (studentId) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getEnrollmentsByStudentID(studentId);

      setEnrollments(data);
    } catch (error) {
      console.error("Error fetching student enrollments:", error);

      setError("Unable to load student enrollments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEnrollment = async (enrollmentId) => {
    return await getEnrollmentByID(enrollmentId);
  };

  const addNewEnrollment = async (enrollmentData) => {
    try {
      await addEnrollment(enrollmentData);

      toast.success("Enrollment added successfully.");

      // Refresh the list only if a list is currently being displayed.
      // The page can call fetchEnrollments() or fetchStudentEnrollments()
      // again after the operation if needed.
    } catch (error) {
      console.error("Error adding enrollment:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while adding the enrollment.");
      }

      throw error;
    }
  };

  const deleteEnrollment = async (enrollmentId) => {
    try {
      await deleteEnrollmentByID(enrollmentId);

      toast.success("Enrollment deleted successfully.");

      // The page can refresh its current enrollment list
      // after the deletion.
    } catch (error) {
      console.error("Error deleting enrollment:", error);

      if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while deleting the enrollment.");
      }

      throw error;
    }
  };

  return {
    enrollments,
    isLoading,
    error,

    fetchEnrollments,
    fetchStudentEnrollments,
    getEnrollment,
    addNewEnrollment,
    deleteEnrollment,
  };
}

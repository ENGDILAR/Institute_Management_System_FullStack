import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  addCourseOfferingMarks,
  addStudentMark,
  getAllMarksByCourseOfferingID,
  getMarksByStudentID,
  updateStudentMark,
} from "@/Services/Admin/ManageStudentMarks";

export default function useStudentMarks() {
  const [marks, setMarks] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSiz: 20,
    totalEnrollments: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMarksByCourseOffering = useCallback(
    async (courseOfferingId, pageNumber = 1, pageSize = 20) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAllMarksByCourseOfferingID(
          courseOfferingId,
          pageNumber,
          pageSize,
        );

        setMarks(response.data || []);

        setPagination({
          pageNumber: response.pageNumber ?? pageNumber,
          pageSiz: response.pageSiz ?? pageSize,
          totalEnrollments: response.TotalEnrollments ?? 0,
          totalPages: response.totalPages ?? 0,
        });

        return response;
      } catch (error) {
        console.error("Error fetching course offering marks:", error);

        const message =
          error.response?.data?.message ||
          "Unable to load student marks. Please try again.";

        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchMarksByStudent = useCallback(async (studentId) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMarksByStudentID(studentId);
      setMarks(data);
      return data;
    } catch (error) {
      console.error("Error fetching student marks:", error);

      const message =
        error.response?.data?.message ||
        "Unable to load student marks. Please try again.";

      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStudentMark = useCallback(async (studentId) => {
    return await getMarksByStudentID(studentId);
  }, []);

  const addMark = useCallback(async (markData) => {
    try {
      const response = await addStudentMark(markData);

      toast.success(response?.message || "Student mark added successfully.");

      return response;
    } catch (error) {
      console.error("Error adding student mark:", error);

      const message =
        error.response?.data?.message ||
        "Something went wrong while adding the student mark.";

      toast.error(message);
      throw error;
    }
  }, []);

  const addMarksForCourseOffering = useCallback(async (marksData) => {
    try {
      const response = await addCourseOfferingMarks(marksData);

      if (response?.skipped > 0) {
        toast.warning(
          `${response.added} mark(s) added, ${response.skipped} mark(s) skipped.`,
        );
      } else {
        toast.success(response?.message || "Marks processed successfully.");
      }

      return response;
    } catch (error) {
      console.error("Error adding course offering marks:", error);

      const message =
        error.response?.data?.message ||
        "Something went wrong while adding the student marks.";

      toast.error(message);
      throw error;
    }
  }, []);

  const updateMark = useCallback(async (markData) => {
    try {
      const response = await updateStudentMark(markData);

      toast.success(response?.message || "Student mark updated successfully.");

      return response;
    } catch (error) {
      console.error("Error updating student mark:", error);

      const message =
        error.response?.data?.message ||
        "Something went wrong while updating the student mark.";

      toast.error(message);
      throw error;
    }
  }, []);

  return {
    marks,
    pagination,
    isLoading,
    error,
    fetchMarksByCourseOffering,
    fetchMarksByStudent,
    getStudentMark,
    addMark,
    addMarksForCourseOffering,
    updateMark,
  };
}

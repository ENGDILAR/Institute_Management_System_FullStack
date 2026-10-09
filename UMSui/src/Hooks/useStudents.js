import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  AddStudent,
  DeleteStudent,
  getStudentById,
  getStudents,
  UpdateStudent,
} from "@/Services/Admin/ManageStudents";

export default function useStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getStudents();

      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);

      setError("Unable to load students. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const getStudent = async (studentId) => {
    return await getStudentById(studentId);
  };

  const addStudent = async (studentData) => {
    try {
      await AddStudent(studentData);

      toast.success("Student added successfully.");

      await fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while adding the student.");
      }

      throw error;
    }
  };

  const updateStudent = async (studentId, studentData) => {
    try {
      await UpdateStudent(studentId, studentData);

      toast.success("Student updated successfully.");

      await fetchStudents();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while updating the student.");
      }

      throw error;
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      await DeleteStudent(studentId);

      toast.success("Student deleted successfully.");

      await fetchStudents();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while deleting the student.");
      }

      throw error;
    }
  };

  return {
    students,
    isLoading,
    error,

    fetchStudents,
    getStudent,
    addStudent,
    updateStudent,
    deleteStudent,
  };
}

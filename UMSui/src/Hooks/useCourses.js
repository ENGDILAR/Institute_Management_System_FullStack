import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getCourses,
  getCourseByID,
  getCourseByName,
  addCourse as addCourseService,
  updateCourse as updateCourseService,
  deleteCourse as deleteCourseService,
} from "@/Services/Admin/ManageCourses";

export default function useCourses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCourses();

      setCourses(data ?? []);
    } catch (error) {
      console.error("Error fetching courses:", error);

      setError("Unable to load courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const getCourse = async (courseId) => {
    return await getCourseByID(courseId);
  };

  const searchCourseByName = async (name) => {
    return await getCourseByName(name);
  };

  const addCourse = async (courseData) => {
    try {
      await addCourseService(courseData);

      toast.success("Course added successfully.");

      await fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid course data.");
      } else {
        toast.error("Something went wrong while adding the course.");
      }

      throw error;
    }
  };

  const updateCourse = async (courseId, courseData) => {
    try {
      await updateCourseService(courseId, courseData);

      toast.success("Course updated successfully.");

      await fetchCourses();
    } catch (error) {
      console.error("Error updating course:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid course data.");
      } else {
        toast.error("Something went wrong while updating the course.");
      }

      throw error;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await deleteCourseService(courseId);

      toast.success("Course deleted successfully.");

      await fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid course ID.");
      } else {
        toast.error("Something went wrong while deleting the course.");
      }

      throw error;
    }
  };

  return {
    courses,
    isLoading,
    error,

    fetchCourses,
    getCourse,
    searchCourseByName,
    addCourse,
    updateCourse,
    deleteCourse,
  };
}

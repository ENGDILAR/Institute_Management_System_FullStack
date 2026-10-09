import { useCallback, useEffect, useState } from "react";

import { getCourses, getCourseByID } from "@/Services/Student/ManageCourses";

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

  return {
    courses,
    isLoading,
    error,

    fetchCourses,
    getCourse,
  };
}

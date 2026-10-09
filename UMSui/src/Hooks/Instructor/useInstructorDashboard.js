import { useEffect, useState } from "react";
import { LoadTeacherDashboard } from "@/Services/Instructor/InstructorDashboard";

export function useInstructorDashboard() {
  const [dashboard, setDashboard] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const data = await LoadTeacherDashboard();

        if (isMounted) {
          setDashboard(data);
        }
      } catch (error) {
        console.error("Error fetching teacher dashboard:", error);

        if (isMounted) {
          setError("Unable to load your academic information.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    dashboard,
    loading,
    error,
  };
}

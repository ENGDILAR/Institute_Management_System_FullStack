import { useCallback, useEffect, useState } from "react";
import { getMyMarks } from "@/Services/Student/ManageMarks";

export default function useMarks() {
  const [marks, setMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyMarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMyMarks();

      setMarks(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching student marks:", error);

      if (error.response?.status === 204) {
        setMarks([]);
      } else {
        setError("Unable to load your marks. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyMarks();
  }, [fetchMyMarks]);

  return {
    marks,
    isLoading,
    error,
    fetchMyMarks,
  };
}

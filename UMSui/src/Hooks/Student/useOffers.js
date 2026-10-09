import { useCallback, useEffect, useState } from "react";

import {
  getCourseOfferingByID,
  getCourseOfferings,
  getOffersByCourseID,
} from "@/Services/Admin/ManageOffers";

export default function useCourseOfferings() {
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchCourseOfferings = useCallback(
    async (page = pageNumber, size = pageSize) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getCourseOfferings(page, size);
        const result = response?.data ?? response ?? [];
        const items = Array.isArray(result) ? result : (result.data ?? []);

        setCourseOfferings(items);
        setPagination({
          pageNumber: response?.pageNumber ?? page,
          pageSize: response?.pageSize ?? size,
          totalCount: response?.totalCount ?? items.length,
          totalPages: response?.totalPages ?? 1,
          hasNextPage: Boolean(response?.hasNextPage),
          hasPreviousPage: Boolean(response?.hasPreviousPage),
        });
      } catch (error) {
        console.error("Error fetching course offerings:", error);
        setError("Unable to load course offerings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [pageNumber, pageSize],
  );

  useEffect(() => {
    fetchCourseOfferings();
  }, [fetchCourseOfferings]);

  const getCourseOffering = async (courseOfferingId) => {
    return await getCourseOfferingByID(courseOfferingId);
  };

  const getOffersByCourse = async (courseId) => {
    try {
      const response = await getOffersByCourseID(courseId);

      return response?.offering ?? [];
    } catch (error) {
      console.error("Error getting course offers:", error);
      throw error;
    }
  };

  const changePage = (newPage) => {
    setPageNumber(newPage);
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    setPageNumber(1);
  };

  return {
    courseOfferings,
    isLoading,
    error,
    pagination,

    pageNumber,
    pageSize,

    fetchCourseOfferings,
    getCourseOffering,
    getOffersByCourse,
    changePage,
    changePageSize,
  };
}

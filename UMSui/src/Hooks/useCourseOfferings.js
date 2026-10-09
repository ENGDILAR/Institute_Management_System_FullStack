import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  addCourseOffering,
  deleteCourseOffering,
  getCourseOfferingByID,
  getCourseOfferings,
  GetInfo,
  getOffersByCourseID,
  updateCourseOffering,
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

  const addNewCourseOffering = async (offeringData) => {
    try {
      await addCourseOffering(offeringData);

      toast.success("Course offering added successfully.");

      await fetchCourseOfferings();
    } catch (error) {
      console.error("Error adding course offering:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        console.log(error.response?.data);
        toast.error("Something went wrong while adding the course offering.");
      }

      throw error;
    }
  };

  const updateExistingCourseOffering = async (
    courseOfferingId,
    offeringData,
  ) => {
    try {
      await updateCourseOffering(courseOfferingId, offeringData);

      toast.success("Course offering updated successfully.");

      await fetchCourseOfferings();
    } catch (error) {
      console.error("Error updating course offering:", error);
      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while updating the course offering.");
      }

      throw error;
    }
  };

  const deleteExistingCourseOffering = async (courseOfferingId) => {
    try {
      await deleteCourseOffering(courseOfferingId);

      toast.success("Course offering deleted successfully.");

      await fetchCourseOfferings();
    } catch (error) {
      console.error("Error deleting course offering:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while deleting the course offering.");
      }

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

  const GetIns_Cours_Data = async () => {
    try {
      const data = await GetInfo();
      return data;
    } catch (error) {
      console.log(error.message);
    }
  };

  return {
    courseOfferings,
    isLoading,
    error,
    pagination,

    pageNumber,
    pageSize,

    GetIns_Cours_Data,
    fetchCourseOfferings,
    getCourseOffering,
    getOffersByCourse,

    addNewCourseOffering,
    updateExistingCourseOffering,
    deleteExistingCourseOffering,

    changePage,
    changePageSize,
  };
}

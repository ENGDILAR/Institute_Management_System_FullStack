import axiosClient from "@/API/axiosClient";

export async function getCourseOfferingByID(id) {
  const response = await axiosClient.get(
    `/api/CourseOffering/GetOfferByID/${id}`,
  );

  return response.data;
}

export async function getOffersByCourseID(id) {
  const response = await axiosClient.get(
    `/api/CourseOffering/GetOfferByCourseID/${id}`,
  );

  return response.data;
}
export async function getCourseOfferings(pageNumber = 1, pageSize = 10) {
  const response = await axiosClient.get(
    "/api/CourseOffering/GetAllCourseOfferings",
    {
      params: {
        pageNumber,
        pageSize,
      },
    },
  );

  return response.data;
}

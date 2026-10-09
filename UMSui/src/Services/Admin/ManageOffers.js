import axiosClient from "@/API/axiosClient";

export async function addCourseOffering(offer) {
  const response = await axiosClient.post(
    "/api/CourseOffering/AddNewOffer",
    offer,
  );

  return response.data;
}

export async function getCourseOfferingByID(id) {
  const response = await axiosClient.get(
    `/api/CourseOffering/GetOfferByID/${id}`,
  );

  return response.data;
}

export async function GetInfo() {
  const response = await axiosClient.get(`/api/CourseOffering/GetInfo`);

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

export async function updateCourseOffering(id, offer) {
  const response = await axiosClient.put(
    `/api/CourseOffering/UpdateOffer/${id}`,
    offer,
  );

  return response.data;
}

export async function deleteCourseOffering(id) {
  const response = await axiosClient.delete(
    `/api/CourseOffering/DeleteOffer/${id}`,
  );

  return response.data;
}

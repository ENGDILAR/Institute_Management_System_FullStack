import axiosClient from "@/API/axiosClient";

export async function getEnrollmentsByOfferID(courseOfferId) {
  const response = await axiosClient.get(
    `/api/Enrollment/GetEnrollmentsByOfferID/${courseOfferId}`,
  );

  if (response.status === 204) {
    return [];
  }

  return Array.isArray(response.data) ? response.data : [];
}

export async function getEnrollmentsByStudentID(studentId) {
  const response = await axiosClient.get(
    `/api/Enrollment/GetEnrollmentsByStudentID/${studentId}`,
  );

  return response.data;
}

export async function getEnrollmentByID(id) {
  const response = await axiosClient.get(
    `/api/Enrollment/GetEnrollmentByID/${id}`,
  );

  return response.data;
}

export async function addEnrollment(enrollment) {
  const response = await axiosClient.post(
    "/api/Enrollment/AddNewEnrollment",
    enrollment,
  );

  return response.data;
}

export async function deleteEnrollmentByID(id) {
  const response = await axiosClient.delete(
    `/api/Enrollment/DeleteEnrollmentByID/${id}`,
  );

  return response.data;
}

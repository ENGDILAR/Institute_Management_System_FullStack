import axiosClient from "@/API/axiosClient";
export async function getEnrollmentsByStudentID(studentId) {
  const response = await axiosClient.get(
    `/api/Enrollment/GetEnrollmentsByStudentID/${studentId}`,
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

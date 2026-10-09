import axiosClient from "@/API/axiosClient";
export async function getCourses() {
  const response = await axiosClient.get("/api/Course/GetAllCourses");
  return response.data;
}
export async function getCourseByID(id) {
  const response = await axiosClient.get(`/api/Course/GetById/${id}`);
  return response.data;
}

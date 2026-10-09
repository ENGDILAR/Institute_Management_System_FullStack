import axiosClient from "@/API/axiosClient";

export async function LoadTeacherDashboard() {
  const response = await axiosClient.get(`/api/Dashboard/instructorDashboard`);

  return response.data;
}

import axiosClient from "@/API/axiosClient";
export async function LoadStudentDashboard() {
  try {
    const response = await axiosClient.get("/api/Dashboard/studentDashboard");

    return response.data;
  } catch (error) {
    console.error("Error Loading Studnet Dashboard:", error);
    throw error;
  }
}
